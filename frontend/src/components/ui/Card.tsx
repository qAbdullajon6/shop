import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-gray-200 bg-white shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("border-b border-gray-200 px-6 py-4", className)} {...props} />
  );
}

function CardBody({ className, ...props }: CardBodyProps) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div className={cn("border-t border-gray-200 px-6 py-4", className)} {...props} />
  );
}

export { Card, CardHeader, CardBody, CardFooter };
