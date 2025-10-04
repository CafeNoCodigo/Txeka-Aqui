import { useState } from "react";
import { Link } from "react-router-dom";
import { logo } from "./../../constants/index";
import { Menu, X } from "lucide-react"; 
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Hero = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setIsOpen(false);
        try {
        await signOut(auth);
        navigate("/login");
        } catch (error) {
        console.error("Erro ao sair:", error);
        }
    };

    return (
        <header className="hero">
            {/* Logo */}
            <Link to="/">
                <img
                    className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
                    src={logo.imgPath}
                    alt={logo.alt}
                />
            </Link>

            {/* Menu Desktop */}
            <nav className="hidden md:flex flex-1 justify-center ">
                <ul className="flex gap-8">
                    <li className="hover:scale-110 transition-transform">
                        <Link
                            className="link"
                            to="/invoices"
                        >
                            Manage Invoice
                        </Link>
                    </li>
                    <li className="hover:scale-110 transition-transform">
                        <Link
                            className="link"
                            to="/account/settings"
                        >
                        Account
                        </Link>
                    </li>
                    <li className="hover:scale-110 transition-transform">
                        <button
                            className="hover:underline cursor-pointer"
                            onClick={() =>{
                                handleLogout();
                            }}
                        >
                            Log out
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Botão Mobile */}
            <button
                className="md:hidden p-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={0} /> : <Menu size={28} />}
            </button>

            {/* Menu Lateral Mobile */}
            {isOpen && (
                <div className="hero-mobile">
                    <button
                        className="self-end mb-4 bg-red-500"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={28} />
                    </button>
                    <Link
                        className="link backdrop-blur-md"
                        to="/invoices"
                        onClick={() => setIsOpen(false)}
                    >
                        Manage Invoice
                    </Link>
                    <Link
                        className="link"
                        to="/account/settings"
                        onClick={() => setIsOpen(false)}
                    >
                        Account
                    </Link>
                    <button
                        className="link cursor-pointer mr-42"
                        onClick={()=>{
                            setIsOpen(false);
                            handleLogout();
                        }}
                    >
                        Log out
                    </button>
                </div>
            )}
        </header>
    );
};

export default Hero;