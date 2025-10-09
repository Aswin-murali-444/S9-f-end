import React from 'react';

const AllServicesIcon = ({ size = 48 }) => {
  const s = Number(size);
  const tile = (x, y) => (
    <rect x={x} y={y} width={s * 0.4} height={s * 0.4} rx={s * 0.08} fill="#BFEFE7" />
  );
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {tile(s * 0.05, s * 0.05)}
      {tile(s * 0.55, s * 0.05)}
      {tile(s * 0.05, s * 0.55)}
      <circle cx={s * 0.7} cy={s * 0.7} r={s * 0.2} fill="#F6A6B8" />
    </svg>
  );
};

export default AllServicesIcon;














