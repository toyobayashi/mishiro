export default function (userLevel: any[]): any[] {
  userLevel.sort((a, b) => a.level - b.level)

  for (let i = 0; i < userLevel.length; i++) {
    if (i !== userLevel.length - 1) userLevel[i].exp = userLevel[i + 1].total_exp - userLevel[i].total_exp
    else userLevel[i].exp = Infinity
  }

  return userLevel
}
