import { Phone } from "lucide-react";

export default function WhatsAppButton() {
  const handleClick = () => {
    const phoneNumber = "8801886039719";
    const text = encodeURIComponent("আমি Chet me wab থেকে সাহায্যের জন্য আসছি");
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-6 w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-green-600 transition-all z-40 active:scale-95 animate-bounce"
      title="হেল্প ডেস্ক"
    >
      <Phone className="w-6 h-6" />
    </button>
  );
}
