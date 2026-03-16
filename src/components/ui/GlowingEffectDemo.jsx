import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "./glowing-effect";

export function GlowingEffectDemo() {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'auto',
            gap: '16px',
        }}>
            <GridItem
                gridArea="1 / 1 / 2 / 7"
                icon={<Box size={16} />}
                title="High-Potential Talent Pool"
                description="Access over 1,500 undergraduate and postgraduate students from CS, Engineering, and Design disciplines."
            />
            <GridItem
                gridArea="1 / 7 / 2 / 13"
                icon={<Settings size={16} />}
                title="Targeted Engagement"
                description="Connect with digitally savvy, brand-conscious Gen Z actively seeking innovation and career pathways."
            />
            <GridItem
                gridArea="2 / 1 / 3 / 7"
                icon={<Lock size={16} />}
                title="Proven Performance"
                description="Partner with an organization capable of generating nearly 500K digital views, amplifying your on-site presence."
            />
            <GridItem
                gridArea="2 / 7 / 3 / 13"
                icon={<Sparkles size={16} />}
                title="Recruitment Ready"
                description="Ideal for HR teams to conduct initial screenings and collect CVs from top-performing competitive programmers."
            />
            <GridItem
                gridArea="3 / 1 / 4 / 13"
                icon={<Search size={16} />}
                title="Brand Amplification"
                description="Featured across all digital content, ceremony stages, and physical event materials throughout the two-day fair."
            />
        </div>
    );
}

const GridItem = ({ gridArea, icon, title, description }) => {
    return (
        <div style={{ gridArea, minHeight: '14rem' }}>
            <div style={{
                position: 'relative',
                height: '100%',
                borderRadius: '1.25rem',
                border: '0.75px solid var(--border)',
                padding: '8px',
            }}>
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    height: '100%',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '24px',
                    overflow: 'hidden',
                    borderRadius: '0.75rem',
                    border: '0.75px solid var(--border)',
                    background: 'var(--bg-card)',
                    padding: '24px',
                    boxShadow: '0px 0px 27px 0px rgba(45,45,45,0.3)',
                }}>
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                    }}>
                        <div style={{
                            width: 'fit-content',
                            borderRadius: '0.5rem',
                            border: '0.75px solid var(--border)',
                            background: 'var(--bg-secondary)',
                            padding: '8px',
                            color: 'var(--text-secondary)',
                        }}>
                            {icon}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <h3 style={{
                                paddingTop: '2px',
                                fontSize: '1.25rem',
                                lineHeight: '1.375rem',
                                fontWeight: 600,
                                fontFamily: 'Syne, sans-serif',
                                letterSpacing: '-0.03em',
                                color: 'var(--text-primary)',
                                marginBottom: 0,
                            }}>
                                {title}
                            </h3>
                            <p style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: '0.875rem',
                                lineHeight: '1.375rem',
                                color: 'var(--text-secondary)',
                                margin: 0,
                            }}>
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
