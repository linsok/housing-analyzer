import { cn } from '../../utils/cn';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
