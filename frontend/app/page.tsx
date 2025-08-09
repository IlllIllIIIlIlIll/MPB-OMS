import Header from "@/components/Header"
import Footer from "@/components/Footer"
import MainBody from "@/components/MainBody"

export default function TransJakartaDisplay() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header at the top */}
      <Header />
      
      {/* Main content body */}
      <MainBody />
      
      {/* Footer at the bottom */}
      <Footer />
    </div>
  )
} 