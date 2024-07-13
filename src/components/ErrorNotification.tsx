import cn from 'classnames';

type Props = {
  valueError: string;
  onClose: () => void;
};

export const ErrorNotification: React.FC<Props> = ({ valueError, onClose }) => {
  return (
    <div
      data-cy="ErrorNotification"
      className={cn(
        'notification',
        'is-danger',
        'is-light',
        'has-text-weight-normal',
        { hidden: !valueError.length },
      )}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={onClose}
      />
      {valueError}
    </div>
  );
};
