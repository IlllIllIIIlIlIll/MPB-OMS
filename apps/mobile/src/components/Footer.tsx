import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Footer: React.FC = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.tabContainer}>
        <View style={[styles.tab, styles.activeTab]}>
          <Image 
            source={require('../public/home.png')} 
            style={[styles.tabIcon, styles.homeIcon]} 
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.tab}>
          <Image 
            source={require('../public/newspaper.png')} 
            style={styles.tabIcon} 
            resizeMode="contain"
          />
          <Text style={styles.tabText}>Feed</Text>
        </View>
        
        <View style={styles.tab}>
          <Image 
            source={require('../public/ticket.png')} 
            style={styles.tabIcon} 
            resizeMode="contain"
          />
          <Text style={styles.tabText}>Ticket</Text>
        </View>
        
        <View style={styles.tab}>
          <Image 
            source={require('../public/profile.png')} 
            style={styles.tabIcon} 
            resizeMode="contain"
          />
          <Text style={styles.tabText}>Profile</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  homeIcon: {
    width: 32,
    height: 32,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#174d9c',
    fontWeight: '600',
  },
});

export default Footer;
