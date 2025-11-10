import React from 'react';
import Modal from './Modal';
import { ScamReport, ScamReportStatus } from '../types';

interface ScamReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ScamReport;
  onUpdateStatus: (reportId: string, newStatus: ScamReportStatus) => void;
}

const ScamReportDetailsModal: React.FC<ScamReportDetailsModalProps> = ({ isOpen, onClose, report, onUpdateStatus }) => {
  if (!report) return null;

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
  );
  
  const handleStatusUpdate = (newStatus: ScamReportStatus) => {
    onUpdateStatus(report.id, newStatus);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ID: #${report.id.substring(0, 8)}...`}>
        <div className="space-y-6">
            {/* Reporter & Accused Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                    <h3 className="font-bold text-gray-800 mb-2">Reported By</h3>
                    <DetailItem label="Name" value={report.reporterName} />
                    <DetailItem label="Email" value={<a href={`mailto:${report.reporterEmail}`} className="text-brand-blue hover:underline">{report.reporterEmail}</a>} />
                </div>
                 <div>
                    <h3 className="font-bold text-gray-800 mb-2">Accused Seller</h3>
                    <DetailItem label="Name" value={report.scammerName} />
                    {report.scammerProfileLink && <DetailItem label="Profile Link" value={<a href={report.scammerProfileLink} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">View Profile</a>} />}
                </div>
            </div>
            
            {/* Report Details */}
            <div>
                 <DetailItem label="Issue Type" value={<span className="font-bold text-red-600 capitalize">{report.issueType}</span>} />
                 <div className="mt-4">
                     <p className="text-sm text-gray-500">Description</p>
                     <div className="mt-1 p-3 bg-gray-50 border rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                        {report.description}
                     </div>
                 </div>
            </div>

            {/* Evidence */}
            {report.evidenceUrls.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Submitted Evidence</h3>
                    <ul className="space-y-2">
                        {report.evidenceUrls.map((url, index) => (
                            <li key={index}>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-brand-blue hover:underline bg-blue-50 p-2 rounded-md border border-blue-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                    View Evidence {index + 1}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Update Status</h3>
                <div className="flex items-center justify-start space-x-2 flex-wrap gap-2">
                    <button onClick={() => handleStatusUpdate('under_review')} className="px-4 py-1 text-sm rounded-full font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200">Mark as Under Review</button>
                    <button onClick={() => handleStatusUpdate('resolved')} className="px-4 py-1 text-sm rounded-full font-semibold bg-green-100 text-green-800 hover:bg-green-200">Mark as Resolved</button>
                    <button onClick={() => handleStatusUpdate('dismissed')} className="px-4 py-1 text-sm rounded-full font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Dismiss Report</button>
                </div>
            </div>
        </div>
    </Modal>
  );
};

export default ScamReportDetailsModal;
