# 実装中の計算式

## IIDX / beatoraja

$Total = \max\left(260, \frac{7.605 * note}{0.01 * note + 6.5}\right)$

![chrome_2025-06-22_18-12-41](https://github.com/user-attachments/assets/26b997b7-9cf5-48f7-980c-0205b626679a)

## pop'n

$Total = \frac{note * \lfloor \frac{3072}{note} \rfloor}{10.24}$

![chrome_2025-06-22_18-32-33](https://github.com/user-attachments/assets/57b13c94-4b7a-482c-810f-ec1d92042df3)

## beatmania

$Total = \frac{note * \lfloor \frac{fix}{note} \rfloor}{55}$

fix 値は以下の通り。

- FINAL: 14933
- 7th: 14000
- core: 16800
- comp2: 12133
- 5th: 13066
- 4th: 20533

## Lunatic Rave 2 / LR2oraja

$Total = 160.0 + (note + \min(\max(note - 400, 0), 200)) * 0.16$

## forgetalia++

$Total = 100 + \frac{note}{8}$

## ナナシグルーブ

$Total = 350$

## BM98

$Total = \max(130, 100 + note)$
