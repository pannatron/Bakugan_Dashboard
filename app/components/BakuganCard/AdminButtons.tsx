'use client';

interface AdminButtonsProps {
  showUpdateForm: boolean;
  showEditForm: boolean;
  setShowUpdateForm: (show: boolean) => void;
  setShowEditForm: (show: boolean) => void;
  hasUpdateDetails: boolean;
}

const AdminButtons = ({
  showUpdateForm,
  showEditForm,
  setShowUpdateForm,
  setShowEditForm,
  hasUpdateDetails,
}: AdminButtonsProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => {
          setShowUpdateForm(!showUpdateForm);
          setShowEditForm(false);
        }}
        className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {showUpdateForm ? 'Cancel' : 'Update Price'}
      </button>
      
      {hasUpdateDetails && (
        <button
          onClick={() => {
            setShowEditForm(!showEditForm);
            setShowUpdateForm(false);
          }}
          className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          {showEditForm ? 'Cancel' : 'Edit Details'}
        </button>
      )}
    </div>
  );
};

export default AdminButtons;
