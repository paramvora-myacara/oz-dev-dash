"use client";

import { useState } from "react";
import OZListingsFooter from "./OZListingsFooter";
import LegalModal from "./LegalModal";

export default function FooterWrapper() {
  const [legalModal, setLegalModal] = useState<{ open: boolean; type: 'disclosures' | 'terms' | 'privacy' | null }>({ open: false, type: null });

  return (
    <div>
      <OZListingsFooter openLegalModal={(type) => setLegalModal({ open: true, type })} />
      <LegalModal
        open={legalModal.open}
        onClose={() => setLegalModal({ open: false, type: null })}
        type={legalModal.type}
      />
    </div>
  );
}
