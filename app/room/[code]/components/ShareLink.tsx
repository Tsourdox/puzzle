import { PropsWithClassName } from '@/utils/general';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';

const ShareLink = (props: PropsWithClassName) => (
  <div className={props.className}>
    <ArrowUpOnSquareIcon height={32} width={32} />
  </div>
);

export default ShareLink;
