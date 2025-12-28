export const PACKAGES = {
  "FREE": {
    "name": "Free Package",
    "monthlyUsd": 0,
    "perks": [
      "All Free Accounts Get 20 RGC On Download Of The Mobile App",
      "All Free Accounts Get 10 RGC Every Month",
      "Access to all our standard social network functions",
      "Up to 15 Second Video Uploads"
    ],
    "monthlyRgc": 10,
    "signupBonusRgc": 20,
    "videoMaxSeconds": 15,
    "privateGroupMaxMembers": 0
  },
  "GOLD": {
    "name": "Gold Package",
    "monthlyUsd": 5.99,
    "perks": [
      "20 Free Coins to try before you buy",
      "20 Reel Gold Coins in Your Wallet every month",
      "Access to Create Private Groups (up to 5 members)",
      "Up to 40 Second Video Uploads",
      "Access to New Premium features"
    ],
    "monthlyRgc": 20,
    "signupBonusRgc": 20,
    "videoMaxSeconds": 40,
    "privateGroupMaxMembers": 5
  },
  "BUSINESS": {
    "name": "Business Basic",
    "monthlyUsd": 14.99,
    "perks": [
      "50 Reel Gold Coins In Your Wallet Every Month",
      "50 Free Coins to try before you buy",
      "Access to Create Private Groups (up to 20 members)",
      "Up to 40 Second Video Uploads"
    ],
    "monthlyRgc": 50,
    "signupBonusRgc": 50,
    "videoMaxSeconds": 40,
    "privateGroupMaxMembers": 20
  },
  "COINS": {
    "name": "Buy Coins",
    "oneTimeUsd": 6.99,
    "perks": [
      "Access to Reel Tok Art Generator",
      "1 RGC = 4 Total Actions Either 4 Reel Mails or 4 Reel Arts"
    ],
    "purchaseRgc": 20
  }
} as const;
export type PackageId = keyof typeof PACKAGES;
