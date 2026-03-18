import { memo } from 'react';
import { IonModal } from '@ionic/react';

/**
 * Sheet-style modal wrapper. Uses Ionic IonModal.
 */
const DesignModal = memo(function DesignModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) {
  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.9}
      breakpoints={[0, 0.5, 0.9, 1]}
      className={`ds-modal ${className}`.trim()}
    >
      <div className="ds-modal-inner">
        {title && (
          <div className="ds-modal-header">
            <h2 className="ds-modal-title">{title}</h2>
          </div>
        )}
        <div className="ds-modal-body">{children}</div>
      </div>
    </IonModal>
  );
});

export default DesignModal;
