import React from 'react';
import { Box, Container, Typography, Chip, Stack, Button } from '@mui/material';
import { Psychology, ShieldOutlined, AssessmentOutlined, GroupOutlined, CheckCircleRounded, ArrowForward } from '@mui/icons-material';
import '../../assets/styles/home/solutions.css';

const solutions = [
    {
        icon: <Psychology />,
        title: 'Triage & Assessments',
        description: 'Standardized digital triage for fast, structured intake that captures symptoms and context with clarity.'
    },
    {
        icon: <GroupOutlined />,
        title: 'Organization Workflows',
        description: 'Multi-tenant orgs, roles, and collaboration tools to keep psychologists and admins aligned.'
    },
    {
        icon: <ShieldOutlined />,
        title: 'Secure Records',
        description: 'Centralized, encrypted records with controlled access for safe storage and compliant sharing.'
    },
    {
        icon: <AssessmentOutlined />,
        title: 'Insights & Reporting',
        description: 'Dashboards that highlight diagnosis trends, activity, and progress to support better decisions.'
    }
];

export default function SolutionsSection() {
    return (
        <Box component="section" id="solutions" className="solutions-section" aria-label="Platform Solutions">
            <Container maxWidth="xl" className="solutions-container">

                {/* Right content column */}
                <Box className="solutions-right">
                    <Box className="solutions-header">
                        <Typography variant="h2" className="solutions-title">
                            Solutions that elevate mental health operations
                        </Typography>
                        <Typography sx={{m: 'auto'}} variant="body1" color="text.secondary" className="solutions-subtitle">
                            Built for independent practitioners and organizations—beautiful, fast, and secure by design.
                        </Typography>
                    </Box>

                    {/* Integrated illustration + checklist */}
                    <Box className="solutions-wrap">
                        <Box className="deco-stack" aria-hidden="true">
                            <div className="deco-blob" />
                            <svg className="deco-network" viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="gradA" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#2563eb" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                                <g fill="none" stroke="url(#gradA)" strokeWidth="1.2" opacity="0.7">
                                    <circle cx="240" cy="180" r="72" />
                                    <circle cx="240" cy="180" r="112" />
                                    <circle cx="240" cy="180" r="152" />
                                </g>
                                <g stroke="url(#gradA)" strokeWidth="1" opacity="0.45">
                                    <path d="M240 28 L420 110" />
                                    <path d="M240 332 L70 260" />
                                    <path d="M60 120 L240 180 L420 240" />
                                </g>
                            </svg>
                            <Box className="deco-core" role="img" aria-label="Platform core">
                                <Psychology />
                            </Box>
                            <Box className="deco-badge b1"><ShieldOutlined /></Box>
                            <Box className="deco-badge b2"><AssessmentOutlined /></Box>
                            <Box className="deco-badge b3"><GroupOutlined /></Box>
                        </Box>

                        <Box component="ul" className="feature-list" role="list">
                            {solutions.map((item, i) => (
                                <Box component="li" key={i} className="feature-item" role="listitem" tabIndex={0} aria-label={item.title}>
                                    <span className="feature-check" aria-hidden="true"><CheckCircleRounded /></span>
                                    <span className="feature-content">
                                        <span className="feature-title">{item.title}</span>
                                        <span className="feature-desc">{item.description}</span>
                                    </span>
                                </Box>
                            ))}
                            <Box className="feature-cta">
                                <Button variant="contained" color="primary" endIcon={<ArrowForward />} aria-label="Explore all solutions">
                                    Explore all solutions
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}


