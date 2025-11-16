'use client';

import { useAuth } from '@/hooks/useAuth';
import { Tooltip } from '@/components/Tooltip';
import { AuthModal, ConfirmationModal } from '@/components/AuthModal';

interface ListingActionButtonsProps {
  slug: string;
}

export default function ListingActionButtons({ slug }: ListingActionButtonsProps) {
  const { 
    isAuthModalOpen, 
    isConfirmationModalOpen, 
    authError, 
    isLoading, 
    userFullName,
    userEmail,
    userPhoneNumber,
    checkHasSignedCAForListing,
    handleRequestVaultAccess, 
    handleSignInOrUp,
    handleContactDeveloper,
    closeModal,
    authContext
  } = useAuth();

  // Check if user has signed CA for this listing
  const hasSignedCAForCurrentListing = checkHasSignedCAForListing(slug);

  const handleVaultAccess = () => {
    if (hasSignedCAForCurrentListing) {
      // User has already signed CA, go directly to vault
      window.location.href = `/${slug}/access-dd-vault`;
    } else {
      // User hasn't signed CA, start the request process
      handleRequestVaultAccess(slug);
    }
  };

  return (
    <>
      <section className="py-8 md:py-16 px-4 md:px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 justify-center">
          <Tooltip 
            content="For access to confidential deal information (i.e. - Private Placement Memorandum, Fund Operating Agreement, Subscription Agreement, and other documents)."
            position="top"
          >
            <button
              className="w-full md:w-[320px] px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
              onClick={handleVaultAccess}
            >
              {hasSignedCAForCurrentListing ? 'View Vault' : 'Request Vault Access'}
            </button>
          </Tooltip>
          <button
            onClick={() => handleContactDeveloper(slug)}
            className="w-full md:w-[320px] px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
          >
            Contact Sponsor/Developer
          </button>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        onSubmit={handleSignInOrUp}
        isLoading={isLoading}
        authError={authError}
        userFullName={userFullName}
        userEmail={userEmail}
        userPhoneNumber={userPhoneNumber}
        authContext={authContext}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeModal}
      />
    </>
  );
}

