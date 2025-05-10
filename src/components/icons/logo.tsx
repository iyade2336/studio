import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5"
      aria-labelledby="iotGuardianLogoTitle"
      role="img"
      {...props}
    >
      <title id="iotGuardianLogoTitle">IoT Guardian Logo</title>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" x="5" y="5" rx="8" ry="8" fill="url(#logoGradient)" />
      <path d="M15 15 h10 v10 h-10z M25 15 h10 v10 h-10z M15 25 h10 v10 h-10z M25 25 h10 v10 h-10z" fill="hsl(var(--primary-foreground))" opacity="0.7" transform="rotate(10 25 25)">
         <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="10s" repeatCount="indefinite"/>
      </path>
       <circle cx="25" cy="25" r="6" fill="hsl(var(--primary-foreground))">
         <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
       </circle>
      <text
        x="55"
        y="33"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        IoT Guardian
      </text>
    </svg>
  );
}
