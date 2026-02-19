export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#13b6ec]/30">
            {children}
        </div>
    );
}
