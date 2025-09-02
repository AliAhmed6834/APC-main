import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Database, Table as TableIcon, Eye, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DatabaseTable {
  name: string;
  status: 'exists' | 'missing';
  records: number;
  type: 'core' | 'admin' | 'analytics' | 'other';
  size?: string;
  hasIndexes?: boolean;
  hasTriggers?: boolean;
  hasRules?: boolean;
  rowSecurity?: boolean;
  error?: string;
}

interface TableColumn {
  column: string;
  type: string;
  nullable: string;
  default: string | null;
  key: string;
}

interface TableData {
  [key: string]: any;
}

const API_BASE_URL = 'http://localhost:5000';

export default function DatabaseInspection() {
  const [loading, setLoading] = useState(false);
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableSchema, setTableSchema] = useState<TableColumn[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const showStatus = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 5000);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => setLogs([]);

  const scanDatabaseTables = async () => {
    setLoading(true);
    showStatus('🔍 Scanning all database tables...', 'info');
    clearLogs();
    
    try {
      addLog('🔍 Connecting to database...');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/database/tables`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const tables = data.tables || [];
      
      addLog(`📊 Found ${tables.length} tables in database`);
      
      setDatabaseTables(tables);
      
      const existingTables = tables.filter((t: DatabaseTable) => t.status === 'exists').length;
      const totalTables = tables.length;
      
      showStatus(`✅ Database scan completed! Found ${existingTables}/${totalTables} tables.`, 'success');
      addLog(`✅ Scan completed: ${existingTables} existing tables out of ${totalTables} total`);
      
    } catch (error: any) {
      showStatus(`❌ Error scanning tables: ${error.message}`, 'error');
      addLog(`❌ Error: ${error.message}`);
      
      // Fallback to known tables from schema
      addLog('📋 Showing known tables from schema...');
      const knownTables: DatabaseTable[] = [
        { name: 'airports', status: 'exists', records: 3, type: 'core' },
        { name: 'booking_status_history', status: 'exists', records: 8, type: 'core' },
        { name: 'bookings', status: 'exists', records: 13, type: 'core' },
        { name: 'email_logs', status: 'exists', records: 0, type: 'core' },
        { name: 'email_templates', status: 'exists', records: 3, type: 'core' },
        { name: 'exchange_rates', status: 'exists', records: 66, type: 'core' },
        { name: 'locale_content', status: 'exists', records: 12, type: 'core' },
        { name: 'parking_lots', status: 'exists', records: 35, type: 'core' },
        { name: 'parking_pricing', status: 'exists', records: 33, type: 'core' },
        { name: 'parking_slots', status: 'exists', records: 625, type: 'core' },
        { name: 'parking_suppliers', status: 'exists', records: 9, type: 'core' },
        { name: 'payment_gateway_configs', status: 'exists', records: 2, type: 'core' },
        { name: 'payment_methods', status: 'exists', records: 1, type: 'core' },
        { name: 'revenue_analytics', status: 'exists', records: 1, type: 'analytics' },
        { name: 'reviews', status: 'exists', records: 6, type: 'core' },
        { name: 'saved_searches', status: 'exists', records: 0, type: 'core' },
        { name: 'search_analytics', status: 'exists', records: 0, type: 'analytics' },
        { name: 'search_filters', status: 'exists', records: 4, type: 'core' },
        { name: 'sessions', status: 'exists', records: 0, type: 'core' },
        { name: 'sms_logs', status: 'exists', records: 0, type: 'core' },
        { name: 'supplier_bookings', status: 'exists', records: 6, type: 'core' },
        { name: 'supplier_contracts', status: 'exists', records: 5, type: 'core' },
        { name: 'supplier_metrics', status: 'exists', records: 0, type: 'analytics' },
        { name: 'supplier_performance', status: 'exists', records: 3, type: 'analytics' },
        { name: 'supplier_sessions', status: 'exists', records: 28, type: 'core' },
        { name: 'supplier_users', status: 'exists', records: 1, type: 'core' },
        { name: 'transactions', status: 'exists', records: 2, type: 'core' },
        { name: 'user_activity_logs', status: 'exists', records: 0, type: 'core' },
        { name: 'user_loyalty', status: 'exists', records: 0, type: 'core' },
        { name: 'user_preferences', status: 'exists', records: 0, type: 'core' },
        { name: 'users', status: 'exists', records: 4, type: 'core' }
      ];
      
      setDatabaseTables(knownTables);
      showStatus(`⚠️ Using fallback data. Found ${knownTables.length} known tables from schema.`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  const getTableData = async (tableName: string, limit = 50) => {
    try {
      addLog(`🔍 Fetching data from ${tableName} table...`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/database/table-data`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          tableName: tableName,
          limit: limit,
          offset: 0
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        addLog(`✅ Successfully fetched ${result.data.length} records from ${tableName}`);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch table data');
      }
      
    } catch (error: any) {
      addLog(`❌ Error fetching data from ${tableName}: ${error.message}`);
      
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        addLog(`🚫 CORS error detected. The server needs to allow cross-origin requests.`);
      }
      
      // Return empty array if API fails
      return [];
    }
  };

  const viewTableData = async () => {
    if (!selectedTable) {
      showStatus('❌ Please select a table first', 'error');
      return;
    }

    showStatus(`📊 Loading data for table: ${selectedTable}`, 'info');
    clearLogs();
    
    try {
      addLog(`📊 Fetching data for ${selectedTable}...`);
      
      const data = await getTableData(selectedTable, 50);
      setTableData(data);
      
      showStatus(`✅ Data loaded for ${selectedTable}`, 'success');
      addLog(`✅ Data loaded: ${data.length} records found`);
      
    } catch (error: any) {
      showStatus(`❌ Error loading data: ${error.message}`, 'error');
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const exportTableData = async () => {
    if (!selectedTable) {
      showStatus('❌ Please select a table first', 'error');
      return;
    }

    showStatus(`📤 Exporting data for table: ${selectedTable}`, 'info');
    
    try {
      const data = await getTableData(selectedTable, 1000);
      
      if (data.length === 0) {
        showStatus('❌ No data to export', 'error');
        return;
      }
      
      const csvContent = convertToCSV(data);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showStatus(`✅ Data exported successfully: ${selectedTable}_export.csv`, 'success');
      
    } catch (error: any) {
      showStatus(`❌ Error exporting data: ${error.message}`, 'error');
    }
  };

  const convertToCSV = (data: TableData[]) => {
    if (data.length === 0) return '';
    
    const columns = Object.keys(data[0]);
    const header = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => `"${row[col] || ''}"`).join(',')
    );
    
    return [header, ...rows].join('\n');
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'analytics': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    scanDatabaseTables();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-600 text-white p-8 rounded-t-xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Database className="h-8 w-8" />
            Airport Parking Database Management
          </h1>
          <p className="text-blue-100">Manage your database, monitor table status, and inspect data</p>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg p-6">
          {/* Status Alert */}
          {status && (
            <Alert className={`mb-6 ${
              status.type === 'success' ? 'border-green-200 bg-green-50' :
              status.type === 'error' ? 'border-red-200 bg-red-50' :
              status.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.type)}
                <AlertDescription>{status.message}</AlertDescription>
              </div>
            </Alert>
          )}

          <Tabs defaultValue="tables" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tables">Database Tables</TabsTrigger>
              <TabsTrigger value="inspect">Table Inspector</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>

            {/* Database Tables Tab */}
            <TabsContent value="tables" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
                    Database Tables Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Button 
                      onClick={scanDatabaseTables} 
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      🔍 Scan All Tables
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {databaseTables.map((table) => (
                      <Card key={table.name} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{table.name}</h4>
                            <Badge className={getTypeBadgeColor(table.type)}>
                              {table.type}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              {table.status === 'exists' ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span>{table.status === 'exists' ? 'Exists' : 'Missing'}</span>
                            </div>
                            <div>Records: {table.records}</div>
                            {table.size && <div>Size: {table.size}</div>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Table Inspector Tab */}
            <TabsContent value="inspect" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Table Inspector
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="table-selector">Select Table to Inspect:</Label>
                      <Select value={selectedTable} onValueChange={setSelectedTable}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a table..." />
                        </SelectTrigger>
                        <SelectContent>
                          {databaseTables.map((table) => (
                            <SelectItem key={table.name} value={table.name}>
                              {table.name} ({table.records} records)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={viewTableData} disabled={!selectedTable}>
                      📊 View Data
                    </Button>
                    <Button onClick={exportTableData} disabled={!selectedTable} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  {tableData.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        📊 Data for table: {selectedTable}
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(tableData[0]).map((column) => (
                                <TableHead key={column}>{column}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableData.slice(0, 10).map((row, index) => (
                              <TableRow key={index}>
                                {Object.values(row).map((value, cellIndex) => (
                                  <TableCell key={cellIndex} className="max-w-xs truncate">
                                    {String(value || '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {tableData.length > 10 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Showing first 10 records of {tableData.length} total
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">Real-time activity logs</p>
                    <Button onClick={clearLogs} variant="outline" size="sm">
                      Clear Logs
                    </Button>
                  </div>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="text-gray-500">No logs yet...</div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
