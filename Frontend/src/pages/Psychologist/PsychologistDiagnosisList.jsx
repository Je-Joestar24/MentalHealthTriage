import React, { useCallback, useState } from "react";
import { Box, Button, Container, Stack, Typography, Card, Divider } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { motion } from 'framer-motion';
import useDiagnosis from "../../hooks/diagnosisHook";
import DiagnosisFilter from "../../components/admin/diagnosis/DiagnosisFilter";
import DiagnosisTableList from "../../components/admin/diagnosis/DiagnosisTableList";
import DiagnosisPagination from "../../components/admin/diagnosis/DiagnosisPaginations";
import DiagnosisAddModal from "../../components/admin/diagnosis/DiagnosisAddModal";
import DiagnosisEditModal from "../../components/admin/diagnosis/DiagnosisEditModal";

export default function PsychologistDiagnosisList() {
    const {
        rows,
        loading,
        filters,
        pagination,
        updateFilters,
        loadDiagnoses,
        confirmDeleteDiagnosis,
    } = useDiagnosis();

    const [openAdd, setOpenAdd] = useState(false);
    const [selected, setSelected] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);

    const handleApplyFilters = useCallback((next) => {
        updateFilters(next);
        loadDiagnoses(next);
    }, [updateFilters, loadDiagnoses]);

    const handleResetFilters = useCallback((defaults) => {
        updateFilters(defaults);
        loadDiagnoses(defaults);
    }, [updateFilters, loadDiagnoses]);

    const handlePageChange = useCallback((page) => {
        const next = { ...filters, page };
        loadDiagnoses(next);
    }, [filters, loadDiagnoses]);

    const handleDelete = useCallback((row) => {
        confirmDeleteDiagnosis(row, () => {
            // This callback only runs if deletion failed - reload to refresh data
            loadDiagnoses(filters);
        });
    }, [confirmDeleteDiagnosis, loadDiagnoses, filters]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack
                component={motion.div}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    mb: 2.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 0.3,
                        }}
                    >
                        Diagnoses
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: '0.8rem',
                            letterSpacing: 0.2,
                            opacity: 0.8,
                        }}
                    >
                        Manage clinical diagnostic definitions
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Button
                        onClick={() => setOpenAdd(true)}
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
                        component={motion.button}
                        whileHover={{
                            scale: 1.02,
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                        }}
                        whileTap={{ scale: 0.98 }}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.8,
                            minHeight: 36,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        New diagnosis
                    </Button>
                </Stack>
            </Stack>

            <Card elevation={0} sx={{ p: 1.5, mb: 1.5 }}>
                <DiagnosisFilter defaultValues={filters} onChange={handleApplyFilters} onReset={handleResetFilters} />
            </Card>

            <DiagnosisTableList
                rows={rows}
                loading={loading}
                onEdit={(row) => { setSelected(row); setOpenEdit(true); }}
                onDelete={handleDelete}
            />

            <Divider sx={{ my: 2 }} />

            <DiagnosisPagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                onChange={handlePageChange}
            />

            <DiagnosisAddModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onCreated={() => {
                    // Modal already refreshes list; keep hook here for extensibility
                }}
            />

            <DiagnosisEditModal
                open={openEdit}
                data={selected}
                onClose={() => { setOpenEdit(false); setSelected(null); }}
                onUpdated={() => {
                    // No reload needed; slice updates on fulfilled
                }}
            />
        </Container>
    );
}