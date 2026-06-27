'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.25, 
        ease: 'easeInOut' 
      }}
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%', 
        flex: 1
      }}
    >
      {children}
    </motion.div>
  )
}
