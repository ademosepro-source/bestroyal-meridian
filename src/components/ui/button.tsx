import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gold-500 text-navy-950 hover:bg-gold-400 focus-visible:outline-gold-500",
  outline:
    "border border-white/30 text-white hover:bg-white/10 focus-visible:outline-white",
  ghost:
    "border border-navy-200 text-navy-800 hover:bg-navy-50 focus-visible:outline-navy-500",
} as const;

type ButtonProps = {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variants[variant],
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
