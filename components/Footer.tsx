import clsx from 'clsx';
import { PropsWithClassName } from './utils';

const Footer = (props: PropsWithClassName) => (
  <footer
    className={clsx('flex text-sm justify-center gap-6', props.className)}
  >
    <a href="https://github.com/Tsourdox" target="_blank" className="">
      Made by @tsourdox
    </a>
    {props.children}
    <a href="https://github.com/Tsourdox/puzzle" target="_blank" className="">
      GitHub
    </a>
  </footer>
);

export default Footer;
