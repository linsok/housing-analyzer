import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, User, Phone, Mail, Home, Users, CheckCircle, XCircle, 
  Clock, AlertCircle, Filter, Search, MessageCircle, Eye, Download
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageViewBookings = () => {
  const [viewings, setViewings] = useState([]);
  const [filteredViewings, setFilteredViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedViewing, setSelectedViewing] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingViewingId, setRejectingViewingId] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactViewing, setContactViewing] = useState(null);

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
        viewing.renter_details?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viewing.property_details?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viewing.renter_details?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viewing.renter_details?.phone?.includes(searchTerm)
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

  const handleConfirmViewing = async (viewingId) => {
    setActionLoading(true);
    try {
      await bookingService.confirmBooking(viewingId);
      toast.success('Viewing confirmed successfully');
      loadViewings();
    } catch (error) {
      console.error('Error confirming viewing:', error);
      toast.error('Failed to confirm viewing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectViewing = (viewingId) => {
    setRejectingViewingId(viewingId);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleContactViewing = (viewing) => {
    setContactViewing(viewing);
    setShowContactModal(true);
  };

  const confirmRejectViewing = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await bookingService.cancelBooking(rejectingViewingId, { reason: rejectReason });
      toast.success('Viewing rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
      setRejectingViewingId(null);
      loadViewings();
    } catch (error) {
      console.error('Error rejecting viewing:', error);
      toast.error('Failed to reject viewing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteViewing = async (viewingId) => {
    setActionLoading(true);
    try {
      await bookingService.completeBooking(viewingId);
      toast.success('Viewing marked as completed');
      loadViewings();
    } catch (error) {
      console.error('Error completing viewing:', error);
      toast.error('Failed to complete viewing');
    } finally {
      setActionLoading(false);
    }
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
      ['Viewing ID', 'Renter Name', 'Email', 'Phone', 'Property', 'Status', 'Visit Time', 'Booked On'].join(','),
      ...filteredViewings.map(viewing => [
        viewing.id,
        viewing.renter_details?.full_name || 'N/A',
        viewing.renter_details?.email || 'N/A',
        viewing.renter_details?.phone || 'N/A',
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
    a.download = `viewings_${new Date().toISOString().split('T')[0]}.csv`;
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
            <h1 className="text-3xl font-bold text-gray-900">Viewing Booking Management</h1>
            <p className="text-gray-600 mt-1">Manage all property viewing requests and appointments</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportViewings}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Link to="/owner/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <Calendar className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{viewings.filter(v => v.status === 'pending').length}</div>
            <div className="text-gray-600 text-sm">Pending Requests</div>
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
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
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
                placeholder="Search by name, email, property..."
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
          <h2 className="text-xl font-semibold mb-6">Property Viewing Requests</h2>
          
          {filteredViewings.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No viewing requests found</p>
              <p className="text-sm mt-2">
                {searchTerm || statusFilter !== 'all' || dateFilter
                  ? 'Try adjusting your filters' 
                  : 'When you receive viewing requests, they will appear here'
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
                          {viewing.renter_details?.full_name || 'Unknown Renter'}
                        </h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Property Visit
                        </Badge>
                        {getStatusBadge(viewing.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {viewing.renter_details?.email || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {viewing.renter_details?.phone || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          {viewing.property_details?.title || 'Unknown Property'}
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
                          <p className="font-medium text-gray-700 mb-1">Message:</p>
                          <p className="text-gray-600">{viewing.message}</p>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactViewing(viewing)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Pending status - show Confirm and Reject buttons */}
                      {viewing.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmViewing(viewing.id)}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectViewing(viewing.id)}
                            disabled={actionLoading}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {/* Confirmed status - show Mark Complete button */}
                      {viewing.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteViewing(viewing.id)}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
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
                  {/* Summary Table */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Request Summary
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 w-1/3">Visitor Name</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{selectedViewing.renter_details?.full_name || 'N/A'}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Email</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{selectedViewing.renter_details?.email || 'N/A'}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Contact</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{selectedViewing.renter_details?.phone || 'N/A'}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Visit Time</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                {formatDateTime(selectedViewing.visit_time)}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Request Submitted</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                {formatDateTime(selectedViewing.created_at)}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">Status</td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              {getStatusBadge(selectedViewing.status)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

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
                    </div>
                  </div>

                  {/* Message */}
                  {selectedViewing.message && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Message from Visitor
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedViewing.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    {selectedViewing.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span>Awaiting your confirmation</span>
                      </div>
                    )}
                    {selectedViewing.status === 'confirmed' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Viewing confirmed - visitor will attend</span>
                      </div>
                    )}
                    {selectedViewing.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Viewing completed</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedViewing.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => {
                            handleConfirmViewing(selectedViewing.id);
                            setShowDetailsModal(false);
                          }}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm Viewing
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleRejectViewing(selectedViewing.id);
                          }}
                          disabled={actionLoading}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {selectedViewing.status === 'confirmed' && (
                      <Button
                        onClick={() => {
                          handleCompleteViewing(selectedViewing.id);
                          setShowDetailsModal(false);
                        }}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Reason Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Reject Viewing Request</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                      setRejectingViewingId(null);
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 mb-3">
                    Please provide a reason for rejecting this viewing request. This will be communicated to the renter.
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                      setRejectingViewingId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmRejectViewing}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject Viewing'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && contactViewing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Contact Renter</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactViewing(null);
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Renter Name</label>
                    <p className="text-gray-900 font-medium">{contactViewing.renter_details?.full_name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{contactViewing.renter_details?.email || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{contactViewing.renter_details?.phone || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                    <p className="text-gray-900">{contactViewing.property_details?.title || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Time</label>
                    <p className="text-gray-900">{formatDateTime(contactViewing.visit_time)}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactViewing(null);
                    }}
                  >
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

export default ManageViewBookings;
