import { PropsWithClassName } from './utils';

const SocialLinks = (props: PropsWithClassName) => (
  <div className={props.className}>
    <a href="https://github.com/Tsourdox" target="_blank" className="">
      Made by @tsourdox
    </a>
    {props.children}
    <a href="https://github.com/Tsourdox/puzzle" target="_blank" className="">
      GitHub
    </a>
  </div>
);

export default SocialLinks;
