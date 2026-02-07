export default function handler(_req: unknown, res: { status: (code: number) => { send: (body: string) => void } }) {
  res.status(200).send('ok');
}
