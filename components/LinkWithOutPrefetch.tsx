import React, { AnchorHTMLAttributes, forwardRef } from "react";
import { useRouter } from "next/router";

const LinkWithOutPrefetch = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(({ children, href, ...rest }, ref) => {
  const { push } = useRouter();

  const onClickPush = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (href) {
      push(href);
    }
  };

  return (
    <a {...rest} onClick={onClickPush} href={href} ref={ref}>
      {children}
    </a>
  );
});

LinkWithOutPrefetch.displayName = "LinkWithOutPrefetch";

export default LinkWithOutPrefetch;
