import { formats, type Format } from './module';

export type ModulePlan = {
  style: Format;
  topics: { topic_id: string; primary: Format; secondary: Format }[];
};

/**
 * The learning style is every topic's primary format. The remaining formats take
 * turns as the secondary, so a student meets each of them across the module.
 */
export function buildPlan(style: Format, topicIds: string[]): ModulePlan {
  const others = formats.filter(format => format !== style);
  return {
    style,
    topics: topicIds.map((topic_id, index) => ({ topic_id, primary: style, secondary: others[index % others.length] })),
  };
}
