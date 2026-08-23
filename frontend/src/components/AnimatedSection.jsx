import React from 'react';
import { motion } from 'framer-motion';
import '../styles/ornaments.css';

export default function AnimatedSection({ 
    children, 
    className = "", 
    style = {},
    animation = "fadeUp", 
    delay = 0,
    duration = 0.8,
    ...rest
}) {
    // Default variants
    const variants = {
        hidden: { 
            opacity: 0, 
            y: animation === "fadeUp" ? 50 : 0,
            x: animation === "fadeLeft" ? 50 : animation === "fadeRight" ? -50 : 0,
            scale: animation === "scale" ? 0.9 : 1
        },
        visible: { 
            opacity: 1, 
            y: 0, 
            x: 0,
            scale: 1,
            transition: { 
                duration, 
                delay,
                ease: [0.25, 0.1, 0.25, 1] // Custom ease out cubic
            } 
        }
    };

    return (
        <motion.div
            className={className}
            style={style}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants}
            {...rest}
        >
            {children}
        </motion.div>
    );
}
