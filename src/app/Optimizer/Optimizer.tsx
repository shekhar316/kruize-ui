import React, { useEffect, useState } from 'react';
import {
    PageSection,
    Title,
    Card,
    CardBody,
    CardTitle,
    Grid,
    GridItem,
    TextContent,
    Text,
    Label,
    Switch,
    Button,
    Alert,
    Flex,
    FlexItem,
    Badge,
    Spinner,
    List,
    ListItem,
    Stack,
    StackItem,
    Pagination,
    Toolbar,
    ToolbarContent,
    ToolbarItem,
    SearchInput
} from '@patternfly/react-core';
import {
    ClockIcon,
    DatabaseIcon,
    FileCodeIcon,
    ChartLineIcon,
    LayerGroupIcon,
    ListIcon,
    CubesIcon,
    WrenchIcon,
    SyncIcon,
    ExclamationTriangleIcon,
    CubeIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@patternfly/react-icons';
import { getOptimizerUrl } from '../CentralConfig';
import './Optimizer.css';
import { Table, Thead, Tr, Th, Tbody, Td, TableVariant } from '@patternfly/react-table';

interface HealthStatus {
    status: string;
    lastCheckedAt: string;
    datasources: string[];
    metadata_profiles: { name: string; profile_version: string }[];
    metric_profiles: { name: string; profile_version: string }[];
    layers: { name: string; profile_version: string }[];
    issues?: string[];
    stats?: {
        total_jobs_created: number;
        total_experiments_created: number;
        total_experiments_processed: number;
    };
}

interface ScanResult {
    namespaces: { name: string; kruizeOptimized: boolean }[];
    workloads?: {
        namespace: string;
        name: string;
        type: string;
        containers: { name: string; image: string }[];
        kruizeOptimized: boolean;
        labels?: Record<string, string>;
    }[];
    deployments?: { // handling fallback
        namespace: string;
        name: string;
        type: string;
        containers: { name: string; image: string }[];
        kruizeOptimized: boolean;
        labels?: Record<string, string>;
    }[];
}

export const Optimizer = () => {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [scanData, setScanData] = useState<ScanResult | null>(null);
    const [diffData, setDiffData] = useState<HealthStatus | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [loadingHealth, setLoadingHealth] = useState(false);
    const [loadingScan, setLoadingScan] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Table State
    const [nsFilter, setNsFilter] = useState('');
    const [nsPage, setNsPage] = useState(1);
    const [nsPerPage, setNsPerPage] = useState(10);

    const [wlFilter, setWlFilter] = useState('');
    const [labelFilter, setLabelFilter] = useState('');
    const [wlPage, setWlPage] = useState(1);
    const [wlPerPage, setWlPerPage] = useState(10);

    const fetchHealth = async () => {
        setLoadingHealth(true);
        try {
            const res = await fetch(`${getOptimizerUrl()}/health/kruize`);
            const data = await res.json();
            setHealth(data);
        } catch (e) {
            console.error("Health check failed", e);
        } finally {
            setLoadingHealth(false);
        }
    };

    const fetchDiff = async () => {
        try {
            const res = await fetch(`${getOptimizerUrl()}/profiles/diff`);
            const data = await res.json();
            setDiffData(data);
        } catch (e) {
            console.error("Profile diff failed", e);
        }
    };

    const fetchWorkloads = async () => {
        setLoadingScan(true);
        const url = showAll ? `${getOptimizerUrl()}/scan?all=true` : `${getOptimizerUrl()}/scan`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            setScanData(data);
        } catch (e) {
            console.error("Scan failed", e);
        } finally {
            setLoadingScan(false);
        }
    };

    const installProfiles = async () => {
        setInstalling(true);
        try {
            const res = await fetch(`${getOptimizerUrl()}/profiles/install`, { method: 'POST' });
            await res.json();
            alert("Installation process completed. Checking Kruize status...");
            fetchHealth();
            fetchDiff();
        } catch (e) {
            alert("Installation failed: " + e);
        } finally {
            setInstalling(false);
        }
    };

    const updateProfiles = async () => {
        if (!diffData) return;
        if (!confirm("Update profiles to latest versions?")) return;
        setUpdating(true);
        try {
            // Construct body from diffData
            // Schema: Map<String, List<String>> (e.g. "metadata_profiles": ["profile1", "profile2"])
            const body: Record<string, string[]> = {};

            if (diffData.metadata_profiles?.length) body['metadata_profiles'] = diffData.metadata_profiles.map(p => p.name);
            if (diffData.metric_profiles?.length) body['metric_profiles'] = diffData.metric_profiles.map(p => p.name);
            if (diffData.layers?.length) body['layers'] = diffData.layers.map(p => p.name);


            const res = await fetch(`${getOptimizerUrl()}/profiles/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            await res.json();
            alert("Profiles updated successfully.");
            fetchHealth();
            fetchDiff();
        } catch (e) {
            alert("Update failed: " + e);
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        fetchWorkloads();
        fetchDiff();
    }, []);

    useEffect(() => {
        fetchWorkloads();
    }, [showAll]);

    // Computed Data
    const workloads = scanData?.workloads || scanData?.deployments || [];

    // Filter & Paginate Namespaces
    const filteredNs = (scanData?.namespaces || []).filter(ns =>
        ns.name.toLowerCase().includes(nsFilter.toLowerCase())
    );
    const paginatedNs = filteredNs.slice((nsPage - 1) * nsPerPage, nsPage * nsPerPage);

    // Filter & Paginate Workloads
    // Filter & Paginate Workloads
    const filteredWl = workloads.filter(w => {
        const matchesText = w.name.toLowerCase().includes(wlFilter.toLowerCase()) ||
            w.namespace.toLowerCase().includes(wlFilter.toLowerCase());

        let matchesLabel = true;
        if (labelFilter) {
            if (!w.labels) matchesLabel = false;
            else {
                const search = labelFilter.toLowerCase();
                const labelStr = Object.entries(w.labels).map(([k, v]) => `${k}=${v}`).join(' ');
                matchesLabel = labelStr.toLowerCase().includes(search);
            }
        }

        return matchesText && matchesLabel;
    });
    const paginatedWl = filteredWl.slice((wlPage - 1) * wlPerPage, wlPage * wlPerPage);

    const renderPagination = (
        itemCount: number,
        page: number,
        perPage: number,
        setPage: (p: number) => void,
        setPerPage: (p: number) => void
    ) => (
        <Pagination
            itemCount={itemCount}
            perPage={perPage}
            page={page}
            onSetPage={(_e, p) => setPage(p)}
            onPerPageSelect={(_e, p) => { setPerPage(p); setPage(1); }}
            isCompact
        />
    );

    return (
        <PageSection>
            <Stack hasGutter>
                <StackItem>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                            <Title headingLevel="h1" size="2xl">
                                <CubeIcon className="pf-u-mr-sm" /> Kruize Optimizer
                            </Title>
                        </FlexItem>
                        <FlexItem>
                            <Label color={health?.status === 'HEALTHY' ? 'green' : 'red'}>
                                {health ? health.status : <Spinner size="sm" />}
                            </Label>
                        </FlexItem>
                    </Flex>
                </StackItem>

                {/* Health Cards Row 1 */}
                <StackItem>
                    <Grid hasGutter>
                        <GridItem span={3}>
                            <Card className="optimizer-card">
                                <CardTitle>
                                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                        <Text component="small" className="pf-u-text-uppercase pf-u-color-200">Last Checked</Text>
                                        <ClockIcon color="var(--pf-global--primary-color--100)" />
                                    </Flex>
                                </CardTitle>
                                <CardBody>
                                    <Title headingLevel="h4" size="xl">
                                        {health?.lastCheckedAt ? new Date(health.lastCheckedAt).toLocaleTimeString() : '-'}
                                    </Title>
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem span={3}>
                            <Card className="optimizer-card">
                                <CardTitle>
                                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                        <Text component="small" className="pf-u-text-uppercase pf-u-color-200">Datasources</Text>
                                        <DatabaseIcon color="var(--pf-global--success-color--100)" />
                                    </Flex>
                                </CardTitle>
                                <CardBody>
                                    <div className="optimizer-list-scrollable">
                                        {health?.datasources?.length ? (
                                            <List isPlain>
                                                {health.datasources.map((ds, i) => <ListItem key={i}>{ds}</ListItem>)}
                                            </List>
                                        ) : <Text className="pf-u-color-400">Loading...</Text>}
                                    </div>
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem span={3}>
                            <Card className="optimizer-card">
                                <CardTitle>
                                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                        <Text component="small" className="pf-u-text-uppercase pf-u-color-200">Metadata Profiles</Text>
                                        <FileCodeIcon color="var(--pf-global--info-color--100)" />
                                    </Flex>
                                </CardTitle>
                                <CardBody>
                                    <div className="optimizer-list-scrollable">
                                        {health?.metadata_profiles?.length ? (
                                            <List isPlain>
                                                {health.metadata_profiles.map((p, i) => (
                                                    <ListItem key={i}>
                                                        <strong>{p.name}</strong> <Label isCompact>v{p.profile_version}</Label>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : <Text className="pf-u-color-400">Loading...</Text>}
                                    </div>
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem span={3}>
                            <Card className="optimizer-card">
                                <CardTitle>
                                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                        <Text component="small" className="pf-u-text-uppercase pf-u-color-200">Metric Profiles</Text>
                                        <ChartLineIcon color="var(--pf-global--warning-color--100)" />
                                    </Flex>
                                </CardTitle>
                                <CardBody>
                                    <div className="optimizer-list-scrollable">
                                        {health?.metric_profiles?.length ? (
                                            <List isPlain>
                                                {health.metric_profiles.map((p, i) => (
                                                    <ListItem key={i}>
                                                        <strong>{p.name}</strong> <Label isCompact>v{p.profile_version}</Label>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : <Text className="pf-u-color-400">Loading...</Text>}
                                    </div>
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </StackItem>

                {/* Health Cards Row 2 */}
                <StackItem>
                    <Grid hasGutter>
                        <GridItem span={6}>
                            <Card className="optimizer-card">
                                <CardTitle>
                                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                        <Text component="small" className="pf-u-text-uppercase pf-u-color-200">Layers</Text>
                                        <LayerGroupIcon color="grey" />
                                    </Flex>
                                </CardTitle>
                                <CardBody>
                                    <div className="optimizer-list-scrollable">
                                        {health?.layers?.length ? (
                                            <List isPlain>
                                                {health.layers.map((l, i) => <ListItem key={i}><strong>{l.name}</strong></ListItem>)}
                                            </List>
                                        ) : <Text className="pf-u-color-400">Loading...</Text>}
                                    </div>
                                </CardBody>
                            </Card>
                        </GridItem>

                    </Grid>
                </StackItem>

                {/* Metrics Row */}
                <StackItem>
                    <Grid hasGutter>
                        <GridItem span={4}>
                            <Card className="optimizer-card pf-m-active">
                                <CardBody className="pf-u-text-align-center">
                                    <Text component="small" className="pf-u-text-uppercase pf-u-color-200">Total Jobs Created</Text>
                                    <Title headingLevel="h2" size="3xl" className="pf-u-color-primary-100">
                                        {health?.stats?.total_jobs_created || 0}
                                    </Title>
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem span={4}>
                            <Card className="optimizer-card pf-m-active">
                                <CardBody className="pf-u-text-align-center">
                                    <Text component="small" className="pf-u-text-uppercase pf-u-color-200">Total Exp. Created</Text>
                                    <Title headingLevel="h2" size="3xl" className="pf-u-success-color-100">
                                        {health?.stats?.total_experiments_created || 0}
                                    </Title>
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem span={4}>
                            <Card className="optimizer-card pf-m-active">
                                <CardBody className="pf-u-text-align-center">
                                    <Text component="small" className="pf-u-text-uppercase pf-u-color-200">Total Exp. Processed</Text>
                                    <Title headingLevel="h2" size="3xl" className="pf-u-info-color-100">
                                        {health?.stats?.total_experiments_processed || 0}
                                    </Title>
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </StackItem>

                {/* Alerts */}
                {health?.status !== 'HEALTHY' && health?.issues && health.issues.length > 0 && (
                    <StackItem>
                        <Alert variant="danger" title="Issues Found" isInline>
                            <List>
                                {health.issues.map((issue, i) => <ListItem key={i}>{issue}</ListItem>)}
                            </List>
                        </Alert>
                    </StackItem>
                )}

                {/* Profile Updates Alert */}
                {diffData && (
                    (diffData.metadata_profiles?.length > 0) ||
                    (diffData.metric_profiles?.length > 0) ||
                    (diffData.layers?.length > 0)
                ) && (
                        <StackItem>
                            <Alert
                                variant="info"
                                title="Profile Updates Available"
                                actionLinks={
                                    <React.Fragment>
                                        <Button variant="link" onClick={updateProfiles} isLoading={updating}>
                                            Update Profiles
                                        </Button>
                                    </React.Fragment>
                                }
                                isInline
                            >
                                New versions of profiles are available.
                            </Alert>
                        </StackItem>
                    )}

                {/* Controls */}
                <StackItem>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                        <FlexItem>
                            <Switch
                                id="show-all-switch"
                                label="Show All Workloads"
                                isChecked={showAll}
                                onChange={() => setShowAll(!showAll)}
                            />
                        </FlexItem>
                        <FlexItem>
                            <Button variant="warning" icon={<WrenchIcon />} onClick={installProfiles} isLoading={installing} className="pf-u-mr-md">
                                Install Missing Profiles / Layers / RuleSets
                            </Button>
                            <Button variant="primary" icon={<SyncIcon />} onClick={() => { fetchHealth(); fetchWorkloads(); }}>
                                Refresh Kruize Status
                            </Button>
                        </FlexItem>
                    </Flex>
                </StackItem>

                {/* Namespaces Table */}
                <StackItem>
                    <Card>
                        <CardTitle>
                            <LayerGroupIcon className="pf-u-mr-sm" /> Namespaces Scanner
                        </CardTitle>
                        <CardBody>
                            <Toolbar>
                                <ToolbarContent>
                                    <ToolbarItem>
                                        <SearchInput
                                            placeholder="Search by namespace name"
                                            value={nsFilter}
                                            onChange={(_event, value) => { setNsFilter(value); setNsPage(1); }}
                                            onClear={() => { setNsFilter(''); setNsPage(1); }}
                                        />
                                    </ToolbarItem>
                                    <ToolbarItem variant="pagination">
                                        {renderPagination(filteredNs.length, nsPage, nsPerPage, setNsPage, setNsPerPage)}
                                    </ToolbarItem>
                                </ToolbarContent>
                            </Toolbar>

                            <Table aria-label="Namespaces Table" variant={TableVariant.compact}>
                                <Thead>
                                    <Tr>
                                        <Th>Namespace</Th>
                                        <Th>Kruize Optimized?</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {paginatedNs.map((ns, i) => (
                                        <Tr key={i}>
                                            <Td>{ns.name}</Td>
                                            <Td>
                                                {ns.kruizeOptimized ?
                                                    <Label color="green" icon={<CheckCircleIcon />}>Yes</Label> :
                                                    <Label color="red" icon={<ExclamationCircleIcon />}>No</Label>
                                                }
                                            </Td>
                                        </Tr>
                                    ))}
                                    {!paginatedNs.length && <Tr><Td colSpan={2}>No namespaces found</Td></Tr>}
                                </Tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </StackItem>

                {/* Workloads Table */}
                <StackItem>
                    <Card>
                        <CardTitle>
                            <CubesIcon className="pf-u-mr-sm" /> Workloads Scanner
                        </CardTitle>
                        <CardBody>
                            <Toolbar>
                                <ToolbarContent>
                                    <ToolbarItem>
                                        <SearchInput
                                            placeholder="Search by workload or namespace"
                                            value={wlFilter}
                                            onChange={(_event, value) => { setWlFilter(value); setWlPage(1); }}
                                            onClear={() => { setWlFilter(''); setWlPage(1); }}
                                        />
                                    </ToolbarItem>
                                    <ToolbarItem>
                                        <SearchInput
                                            placeholder="Filter by Label (key=value)"
                                            value={labelFilter}
                                            onChange={(_event, value) => { setLabelFilter(value); setWlPage(1); }}
                                            onClear={() => { setLabelFilter(''); setWlPage(1); }}
                                        />
                                    </ToolbarItem>
                                    <ToolbarItem variant="pagination">
                                        {renderPagination(filteredWl.length, wlPage, wlPerPage, setWlPage, setWlPerPage)}
                                    </ToolbarItem>
                                </ToolbarContent>
                            </Toolbar>

                            <Table aria-label="Workloads Table" variant={TableVariant.compact}>
                                <Thead>
                                    <Tr>
                                        <Th>Namespace</Th>
                                        <Th>Workload</Th>
                                        <Th>Type</Th>
                                        <Th>Labels</Th>
                                        <Th>Containers</Th>
                                        <Th>Kruize Optimized?</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {paginatedWl.map((w, i) => (
                                        <Tr key={i}>
                                            <Td>{w.namespace}</Td>
                                            <Td>{w.name}</Td>
                                            <Td>{w.type}</Td>
                                            <Td>
                                                {w.labels ?
                                                    Object.entries(w.labels).map(([k, v]) => (
                                                        <Label key={k} color="blue" isCompact className="pf-u-mr-xs pf-u-mb-xs">
                                                            {k}={v}
                                                        </Label>
                                                    )) : '-'
                                                }
                                            </Td>
                                            <Td>
                                                <List isPlain>
                                                    {w.containers?.map((c, j) => {
                                                        const datasource = health?.datasources?.[0] || 'prometheus-1';
                                                        const experimentName = `${datasource}|default|${w.namespace}|${w.name}(${w.type.toLowerCase()})|${c.name}`;
                                                        return (
                                                            <ListItem key={j}>
                                                                <a href={`/experiments?experiment_name=${experimentName}`} style={{ textDecoration: 'none' }}>
                                                                    <strong>{c.name}</strong> <span className="pf-u-color-200">({c.image})</span>
                                                                </a>
                                                            </ListItem>
                                                        );
                                                    })}
                                                </List>
                                            </Td>
                                            <Td>
                                                {w.kruizeOptimized ?
                                                    <Label color="green" icon={<CheckCircleIcon />}>Yes</Label> :
                                                    <Label color="red" icon={<ExclamationCircleIcon />}>No</Label>
                                                }
                                            </Td>
                                        </Tr>
                                    ))}
                                    {!paginatedWl.length && <Tr><Td colSpan={5}>No workloads found</Td></Tr>}
                                </Tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </StackItem>
            </Stack>
        </PageSection>
    );
};
