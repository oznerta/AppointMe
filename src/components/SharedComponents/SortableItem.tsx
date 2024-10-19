import React, { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GoGrabber } from 'react-icons/go';

interface SortableItemProps {
  id: string;
  children: ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div {...listeners} className="grabber" style={{ cursor: 'grab' }}>
          {/* This is the draggable part */}
          <GoGrabber className='text-text-500 text-3xl' />
        </div>
        {/* This is the non-draggable content */}
        <div style={{ flexGrow: 1 }}>
          {children}
        </div>
      </div>
    </li>
  );
};

export default SortableItem;
