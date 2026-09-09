export const Loading = () => {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="amber" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD37A"/>
      <stop offset="100%" stop-color="#E8873B"/>
    </linearGradient>
    <clipPath id="tubeClip">
      <rect x="20" y="20" width="160" height="120" rx="18"/>
    </clipPath>
  </defs>


  <rect x="20" y="20" width="160" height="120" rx="18" fill="none" stroke="url(#amber)" stroke-width="4"/>


  <g clip-path="url(#tubeClip)">


    <g opacity="0.35">
      <rect x="20" y="0" width="160" height="3" fill="url(#amber)">
        <animate attributeName="y" values="20;140;20" dur="2.4s" repeatCount="indefinite"/>
      </rect>
      <rect x="20" y="0" width="160" height="2" fill="url(#amber)" opacity="0.6">
        <animate attributeName="y" values="140;20;140" dur="2.4s" repeatCount="indefinite"/>
      </rect>
    </g>


    <g opacity="0.12" stroke="url(#amber)" stroke-width="1">
      <line x1="20" y1="36" x2="180" y2="36"/>
      <line x1="20" y1="52" x2="180" y2="52"/>
      <line x1="20" y1="68" x2="180" y2="68"/>
      <line x1="20" y1="84" x2="180" y2="84"/>
      <line x1="20" y1="100" x2="180" y2="100"/>
      <line x1="20" y1="116" x2="180" y2="116"/>
      <line x1="20" y1="132" x2="180" y2="132"/>
    </g>


    <rect x="20" y="78" width="160" height="4" fill="url(#amber)">
      <animate attributeName="height" values="4;70;4" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="y" values="78;45;78" dur="1.8s" repeatCount="indefinite"/>
    </rect>
  </g>


  <text x="99" y="164" font-family="'Courier New', monospace" font-size="14" font-weight="700"
        fill="#3FD7E0" text-anchor="middle" letter-spacing="3" opacity="0.65">LOADING</text>
  <text x="101" y="164" font-family="'Courier New', monospace" font-size="14" font-weight="700"
        fill="#E85B4C" text-anchor="middle" letter-spacing="3" opacity="0.65">LOADING</text>
  <text x="100" y="164" font-family="'Courier New', monospace" font-size="14" font-weight="700"
        fill="url(#amber)" text-anchor="middle" letter-spacing="3">
    LOADING
    <animate attributeName="opacity" values="1;0.7;1" dur="0.6s" repeatCount="indefinite"/>
  </text>
</svg>
  )
};