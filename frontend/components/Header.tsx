import Image from "next/image"

export default function Header() {
  return (
    <div className="bg-blue-800 text-white px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-transparent rounded-lg flex items-center justify-center border border-transparent">
            <Image 
              src="/TJ-Putih 1.png" 
              alt="TransJakarta Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="w-px h-8 bg-white mx-2"></div>
          <h1 className="text-2xl font-bold">Cempaka Mas Arah Pulo Gadung</h1>
        </div>
        
        {/* Route indicators */}
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">2</span>
          </div>
          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">7F</span>
          </div>
          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">2A</span>
          </div>
        </div>
      </div>
    </div>
  )
}
