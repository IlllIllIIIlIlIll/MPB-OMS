import Header from "@/components/Header"
import Footer from "@/components/Footer"
import MainBody from "@/components/MainBody"

export default function TransJakartaDisplay() {
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header fixed at the top */}
      <div className="flex-shrink-0">
        <Header />
      </div>
      
      {/* Main content body - flexible height */}
      <div className="flex-1 overflow-hidden">
        <MainBody />
      </div>
      
      {/* Footer fixed at the bottom */}
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  )
} 