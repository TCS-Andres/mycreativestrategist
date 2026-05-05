export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="The Creative Strategist"
      >
        <rect x="2" y="2" width="40" height="40" rx="10" fill="#1C192A" />
        <path
          d="M11 28V16h6.5a4.5 4.5 0 010 9H15v3h-4zm4-8.5h2a1 1 0 100-2h-2v2zM23 28V16h4.4l3.4 12h-3.4l-.6-2h-2.8l-.6 2H23zm3.6-4.4h1.7l-.85-3.5-.85 3.5z"
          fill="#F28D3D"
        />
        <circle cx="34.5" cy="14.5" r="2.5" fill="#FCDF09" />
      </svg>
    </div>
  );
}
