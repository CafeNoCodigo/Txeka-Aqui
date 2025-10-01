import { useState } from "react";
import { Link } from "react-router-dom";
import { logo } from "./../../constants/index";
import { Menu, X } from "lucide-react"; 

const Hero = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="hero">
        {/* Logo */}
        <Link to="/">
            <img
            className="w-8 h-8 cursor-pointer"
            src={logo.imgPath}
            alt={logo.alt}
            />
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-8">
            <li>
                <Link
                className="link"
                to="/invoices"
                >
                Manage Invoice
                </Link>
            </li>
            <li>
                <Link
                className="link"
                to="/"
                >
                Account
                </Link>
            </li>
            </ul>
        </nav>

        {/* Botão Mobile */}
        <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
        >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Menu Lateral Mobile */}
        {isOpen && (
            <div className="hero-mobile">
            <button
                className="self-end mb-4"
                onClick={() => setIsOpen(false)}
            >
                <X size={28} />
            </button>
            <Link
                className="underline hover:text-gray-300 transition-colors"
                to="/invoices"
                onClick={() => setIsOpen(false)}
            >
                Manage Invoice
            </Link>
            <Link
                className="underline hover:text-gray-300 transition-colors"
                to="/"
                onClick={() => setIsOpen(false)}
            >
                Account
            </Link>
            </div>
        )}
        </header>
    );
    };

export default Hero;