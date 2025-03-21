import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PreviewContentProps {
  content: ReactNode;
}

export function PreviewContent({ content }: PreviewContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="min-h-[200px] w-full h-full"
    >
      {content}
    </motion.div>
  );
}
