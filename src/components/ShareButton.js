import { buildCardParamsLabel } from './shareLabels';
import { shareParams, shareUrl, xIntentUrl } from '../domain/shareLinks';

const base = () => (typeof window !== 'undefined' && /sebiche\.com$/.test(window.location.hostname) ? window.location.origin : undefined);

// Opens an X post with a link to /api/share, which serves the OG card and redirects back here.
function ShareButton({ type, rival, name, date, text, label = 'Compartir en X' }) {
  const url = shareUrl(shareParams(type, { rival, name, date }), base());
  return (
    <a className="btn btn-ghost share-x" href={xIntentUrl(text || buildCardParamsLabel(type, { rival, name }), url)} target="_blank" rel="noopener noreferrer">
      <span aria-hidden="true">𝕏</span> {label}
    </a>
  );
}

export default ShareButton;
