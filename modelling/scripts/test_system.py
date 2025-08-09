#!/usr/bin/env python3
"""
Test script for MPB-OMS Crowd Counting System
Verifies that all components can be imported and basic functionality works
"""

import sys
import numpy as np
import cv2

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import modeling
        print("✓ modeling.py imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import modeling.py: {e}")
        return False
    
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'configs'))
        import config
        print("✓ config.py imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import config.py: {e}")
        return False
    
    # Test optional dependencies
    optional_deps = {
        'flask': 'Flask web server',
        'ultralytics': 'YOLO detection',
        'torch': 'PyTorch for CSRNet',
        'pandas': 'Data generation'
    }
    
    for module, description in optional_deps.items():
        try:
            __import__(module)
            print(f"✓ {description} available")
        except ImportError:
            print(f"⚠ {description} not available (optional)")
    
    return True

def test_basic_functionality():
    """Test basic crowd counting functionality"""
    print("\nTesting basic functionality...")
    
    try:
        from modeling import BackgroundSubtractionCounter
        
        # Create counter
        counter = BackgroundSubtractionCounter(640, 480)
        print("✓ BackgroundSubtractionCounter created")
        
        # Test with dummy frame
        dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        count, annotated = counter.process_frame(dummy_frame)
        
        print(f"✓ Frame processing works (count: {count})")
        print(f"✓ Annotated frame shape: {annotated.shape}")
        
        return True
        
    except Exception as e:
        print(f"✗ Basic functionality test failed: {e}")
        return False

def test_yolo_functionality():
    """Test YOLO functionality if available"""
    print("\nTesting YOLO functionality...")
    
    try:
        from modeling import YOLOCounter
        
        # This will only work if YOLO dependencies are available
        counter = YOLOCounter()
        print("✓ YOLOCounter created successfully")
        
        # Test with dummy frame
        dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        count, annotated = counter.process_frame(dummy_frame)
        
        print(f"✓ YOLO processing works (count: {count})")
        return True
        
    except ImportError:
        print("⚠ YOLO dependencies not available (optional)")
        return True
    except Exception as e:
        print(f"✗ YOLO functionality test failed: {e}")
        return False

def test_data_generation():
    """Test data generation if pandas is available"""
    print("\nTesting data generation...")
    
    try:
        from modeling import generate_mock_data
        
        # Generate small dataset
        df = generate_mock_data(5, "test_data.csv")
        print(f"✓ Generated {len(df)} data records")
        
        # Clean up
        import os
        if os.path.exists("test_data.csv"):
            os.remove("test_data.csv")
            print("✓ Test file cleaned up")
        
        return True
        
    except ImportError:
        print("⚠ Pandas not available for data generation (optional)")
        return True
    except Exception as e:
        print(f"✗ Data generation test failed: {e}")
        return False

def test_configuration():
    """Test configuration loading"""
    print("\nTesting configuration...")
    
    try:
        import config
        
        # Check some key configuration values
        assert hasattr(config, 'DEFAULT_FRAME_WIDTH')
        assert hasattr(config, 'DEFAULT_FRAME_HEIGHT')
        assert hasattr(config, 'YOLO_MODEL_PATH')
        
        print("✓ Configuration values accessible")
        print(f"  - Frame size: {config.DEFAULT_FRAME_WIDTH}x{config.DEFAULT_FRAME_HEIGHT}")
        print(f"  - YOLO model: {config.YOLO_MODEL_PATH}")
        
        return True
        
    except Exception as e:
        print(f"✗ Configuration test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("MPB-OMS Crowd Counting System - Test Suite")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_basic_functionality,
        test_yolo_functionality,
        test_data_generation,
        test_configuration
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} crashed: {e}")
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! System is ready to use.")
        return 0
    else:
        print("⚠ Some tests failed. Check dependencies and configuration.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

