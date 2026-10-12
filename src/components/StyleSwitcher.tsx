import { chooseLearningStyle } from '@/app/actions/learner';
import { formatInfo, formats, type Format } from '@/lib/module';

export function StyleSwitcher({ current }: { current: Format }) {
  return (
    <form className="ui-segment" action={chooseLearningStyle} aria-label="Switch learning style">
      {formats.map(format => (
        <button key={format} type="submit" name="style" value={format} aria-pressed={format === current}>{formatInfo[format].short}</button>
      ))}
    </form>
  );
}
