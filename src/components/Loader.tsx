import { motion } from "framer-motion";

type LoaderProps = {
  text?: string;
  size?: number; // tamanho do círculo
};

export default function Loader({ text = "Carregando...", size = 60 }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {/* Animação principal */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="rounded-full border-t-4 border-green-500 border-solid"
          style={{ width: size, height: size }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.div
          className="absolute rounded-full border-b-4 border-green-400 border-solid opacity-70"
          style={{ width: size * 0.7, height: size * 0.7 }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-green-500 shadow-lg"
          animate={{
            y: [-(size / 2 + 10), -(size / 2 + 20), -(size / 2 + 10)],
          }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
      </div>

      {/* Texto com animação */}
      <motion.span
        className="mt-4 text-lg font-semibold text-green-600"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {text}
      </motion.span>
    </div>
  );
}