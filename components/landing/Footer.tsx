import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="border-t border-zinc-800 bg-black">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.svg" alt="Accountify" width={24} height={24} className="rounded" />
                            <span className="text-sm font-semibold text-white">Accountify</span>
                        </div>
                        <p className="text-xs text-zinc-500">
                            Forging better habits, one day at a time.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Roadmap</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-600">
                    © {new Date().getFullYear()} Accountify. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

