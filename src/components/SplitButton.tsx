import React from 'react';

interface SplitButtonProps {
  isSplit: boolean;
  onClick: () => void;
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  isSplit,
  onClick,
}) => {
  return (
    <button className="split-view-button-custom" onClick={onClick}>
      {isSplit ? 'Unsplit' : 'Split'}
    </button>
  );
};
