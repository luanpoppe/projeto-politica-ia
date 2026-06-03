import { ReactNode } from "react";

type FeatureIconProps = {
  children: ReactNode;
};

function FeatureIcon({ children }: FeatureIconProps) {
  return (
    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
      {children}
    </div>
  );
}

function LandmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M4 20h16M6 20V10l6-4 6 4v10M10 20v-6h4v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M12 21s6-5.686 6-10a6 6 0 10-12 0c0 4.314 6 10 6 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2zM10 20a2 2 0 004 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M7 11l2-2 3 3 5-5 2 2M4 14l3 3M17 14l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const featureIcons = {
  landmark: (
    <FeatureIcon>
      <LandmarkIcon />
    </FeatureIcon>
  ),
  mapPin: (
    <FeatureIcon>
      <MapPinIcon />
    </FeatureIcon>
  ),
  bell: (
    <FeatureIcon>
      <BellIcon />
    </FeatureIcon>
  ),
  handshake: (
    <FeatureIcon>
      <HandshakeIcon />
    </FeatureIcon>
  ),
};
