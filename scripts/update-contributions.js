const { execFileSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;
const result = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`, '-f', 'login=ahmed6ww'], { encoding: 'utf8' }));
const weeks = result.data.user.contributionsCollection.contributionCalendar.weeks;
const colors = { NONE: '#343b38', FIRST_QUARTILE: '#527762', SECOND_QUARTILE: '#659477', THIRD_QUARTILE: '#79ad8a', FOURTH_QUARTILE: '#91cba2' };
const width = weeks.length * 15 + 2;
const rects = weeks.flatMap((week, x) => week.contributionDays.map(day => {
  const y = new Date(`${day.date}T00:00:00Z`).getUTCDay();
  const fill = colors[day.contributionLevel];
  if (!fill) throw new Error(`Unknown contribution level: ${day.contributionLevel}`);
  return `<rect x="${x * 15 + 1}" y="${y * 15 + 1}" width="11" height="11" rx="2" fill="${fill}"><title>${day.date}: ${day.contributionCount} contribution(s)</title></rect>`;
})).join('');
writeFileSync('assets/contribution-calendar.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="107" viewBox="0 0 ${width} 107" role="img" aria-label="GitHub contribution calendar: gray indicates no contributions and green indicates contribution activity.">${rects}</svg>\n`);
