import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Home, User, Phone, Mail, CheckCircle, 
  XCircle, Clock, AlertCircle, Filter, Search, Eye, Download
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyVisitBookings = () => {
  const [viewings, setViewings] = useState([]);
  const [filteredViewings, setFilteredViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedViewing, setSelectedViewing] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadViewings();
  }, []);

  useEffect(() => {
    filterViewings();
  }, [viewings, searchTerm, statusFilter, dateFilter]);

  const loadViewings = async () => {
    try {
      const data = await bookingService.getViewings({ booking_type: 'visit' });
      setViewings(data.results || data);
    } catch (error) {
      console.error('Error loading viewings:', error);
      toast.error('Failed to load viewing bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterViewings = () => {
    let filtered = viewings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(viewing => 
        viewing.property_details?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viewing.property_details?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(viewing => viewing.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(viewing => {
        const viewingDate = new Date(viewing.created_at);
        return viewingDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredViewings(filtered);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'info',
      cancelled: 'error',
      rejected: 'error'
    };
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />
    };
    
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const showViewingDetails = (viewing) => {
    setSelectedViewing(viewing);
    setShowDetailsModal(true);
  };

  const exportViewings = () => {
    const csvContent = [
      ['Viewing ID', 'Property', 'Status', 'Visit Time', 'Requested On'].join(','),
      ...filteredViewings.map(viewing => [
        viewing.id,
        viewing.property_details?.title || 'N/A',
        viewing.status,
        viewing.visit_time,
        viewing.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Visit Bookings</h1>
            <p className="text-gray-600 mt-1">Manage your property viewing appointments</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportViewings}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Link to="/renter/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{viewings.filter(v => v.status === 'pending').length}</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </Card>
          <Card className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{viewings.filter(v => v.status === 'confirmed').length}</div>
            <div className="text-gray-600 text-sm">Confirmed</div>
          </Card>
          <Card className="text-center">
            <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{viewings.filter(v => v.status === 'completed').length}</div>
            <div className="text-gray-600 text-sm">Completed</div>
          </Card>
          <Card className="text-center">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{viewings.length}</div>
            <div className="text-gray-600 text-sm">Total Viewings</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by property name, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Filter by date"
            />

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              {filteredViewings.length} of {viewings.length} viewings
            </div>
          </div>
        </Card>

        {/* Viewings List */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Property Viewing Appointments</h2>
          
          {filteredViewings.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No viewing appointments found</p>
              <p className="text-sm mt-2">
                {searchTerm || statusFilter !== 'all' || dateFilter
                  ? 'Try adjusting your filters' 
                  : 'When you schedule property viewings, they will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredViewings.map((viewing) => (
                <div key={viewing.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {viewing.property_details?.title || 'Unknown Property'}
                        </h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Property Visit
                        </Badge>
                        {getStatusBadge(viewing.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          {viewing.property_details?.address || 'No address'}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Visit: {formatDateTime(viewing.visit_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          Requested on: {formatDateTime(viewing.created_at)}
                        </div>
                      </div>
                      
                      {viewing.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <p className="font-medium text-gray-700 mb-1">Your Message:</p>
                          <p className="text-gray-600">{viewing.message}</p>
                        </div>
                      )}
                      
                      {/* Rejection Reason */}
                      {viewing.status === 'rejected' && viewing.owner_notes && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                          <p className="font-medium text-red-700 mb-1">Rejection Reason:</p>
                          <p className="text-red-600">{viewing.owner_notes}</p>
                        </div>
                      )}
                      
                      {/* Contact Information */}
                      {viewing.contact_phone && (
                        <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                          <p className="font-medium text-blue-800 mb-1">Your Contact Information:</p>
                          <div className="text-blue-700">
                            {viewing.contact_phone && <div>Phone: {viewing.contact_phone}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showViewingDetails(viewing)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Viewing Details Modal */}
        {showDetailsModal && selectedViewing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Viewing Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Property Details */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Property Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div><strong>Property:</strong> {selectedViewing.property_details?.title || 'N/A'}</div>
                      <div><strong>Address:</strong> {selectedViewing.property_details?.address || 'N/A'}</div>
                      <div><strong>City:</strong> {selectedViewing.property_details?.city || 'N/A'}</div>
                      <div><strong>Type:</strong> {selectedViewing.property_details?.property_type || 'N/A'}</div>
                      <div><strong>Owner Phone:</strong> {selectedViewing.property_details?.owner_phone || 'Not provided'}</div>
                    </div>
                  </div>

                  {/* Viewing Information */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Viewing Information
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 w-1/3">Visit Time</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                {formatDateTime(selectedViewing.visit_time)}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Status</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{getStatusBadge(selectedViewing.status)}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Requested On</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                {formatDateTime(selectedViewing.created_at)}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Your Contact Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {selectedViewing.contact_phone && (
                        <div><strong>Phone:</strong> {selectedViewing.contact_phone}</div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  {selectedViewing.message && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Your Message
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedViewing.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedViewing.status === 'rejected' && selectedViewing.owner_notes && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        Rejection Reason
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{selectedViewing.owner_notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end items-center mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600 mr-4">
                    {selectedViewing.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span>Awaiting property owner confirmation</span>
                      </div>
                    )}
                    {selectedViewing.status === 'confirmed' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Viewing confirmed - please attend on time</span>
                      </div>
                    )}
                    {selectedViewing.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Viewing completed</span>
                      </div>
                    )}
                    {selectedViewing.status === 'rejected' && (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Viewing request rejected</span>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVisitBookings;
