import React from 'react';
import { motion } from 'framer-motion';

const SectionLabel = ({ text, className = '' }) => {
    return (
        <motion.div
            className={`label ${className}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '16px', display: 'inline-block' }}
        >
            {text}
        </motion.div>
    );
};

export default SectionLabel;
