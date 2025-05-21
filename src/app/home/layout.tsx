
import Shell from "@/components/shell";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen"> {/* Ensure this container takes full screen height and lays out children vertically */}
      <Shell>
        {children}
      </Shell>
    </div>
  )
}
