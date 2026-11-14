import json,re,sys
base=json.load(open('/tmp/claude-0/cd/motor-ilustrado/testes/wukong-3.json'))
WK=dict(base['elenco']['wk_armado'])
def A(i,p,r,u,v=0.93,e=1.0,**k): d=dict(id=i,pose=p,rosto=r,u=u,v=v,esc=e); d.update(k); return d
def L(txt,fundo,z,x,y,fx,atores,cartao=None):
    c=dict(fundo=fundo,cam=dict(z=z,x=x,y=y),fx=fx)
    if atores: c['atores']=atores
    if cartao: c['cartao']=cartao
    return dict(texto=txt,pausa=0.4,cena=c)
imp=dict(tipo='humano',rosto_cor='#f0d4a8',cabelo='coque',cabelo_cor='#1a1a1a',barba_estilo='chinesa',barba='#1a1a1a',manto='#d8a431',tiara=True)
laozi=dict(tipo='humano',rosto_cor='#f0d8b8',cabelo='lados',cabelo_cor='#eeeeee',barba_estilo='cheia',barba='#f4f4f4',manto='#7a7a86')
P4=dict(base, codigo='CLX04', _obs='Wukong ilustrado parte 4 (publica como CL061).', parte=4)
P4['elenco']=dict(wk=dict(base['elenco']['wk']), wk_armado=WK, imperador=imp, laozi=laozi,
  cavalarico=dict(tipo='humano',rosto_cor='#e8c8a0',cabelo='curtinho',cabelo_cor='#2a1a10',roupa='tunica',roupa_cor='#6a7a4a'),
  rainha_mae=dict(tipo='humano',rosto_cor='#f4dcc0',cabelo='coque',cabelo_cor='#1a1a1a',roupa='tunica',roupa_cor='#b8231c',tiara=True),
  general=dict(tipo='humano',rosto_cor='#e0c098',cabelo='careca',armadura='#8a8a96',faixa='#1f3a6a',elmo=True,arma='espada'),
  soldado=dict(tipo='humano',rosto_cor='#e0c098',cabelo='careca',armadura='#a8a8b0',faixa='#b8231c',elmo=True,arma='lanca'),
  erlang=dict(tipo='humano',rosto_cor='#f0d4b0',olhos_ouro=True,cabelo='careca',armadura='#c8ccd8',faixa='#2a4a8a',elmo=True,arma='lanca'),
  clone1=dict(base['elenco']['macaco1'],arma='bastao'), clone2=dict(base['elenco']['macaco2'],arma='bastao'))
P4['lineas']=[
 L("What happens when you insult a monkey who already erased his own death?","salao-jade",[1.5,1.7],0.5,0.58,["dourado"],[A('wk_armado','parado','raiva',0.5,0.93,1.25)]),
 L("Heaven's answer was not an army. It was a job.","salao-jade",[1.1,1.25],0.5,0.6,["dourado","neblina"],[A('imperador','sentar','sorriso',0.62,0.9,1.0),A('wk_armado','curvar','calmo',0.36,0.93,0.95)]),
 L("The Jade Emperor named Wukong the official Keeper of the Heavenly *Horses*.","salao-jade",[1.3,1.45],0.6,0.58,["brilho"],[A('imperador','apontar','sorriso',0.6,0.92,1.05)],dict(tipo='nome',titulo='The Jade Emperor',sub='Ruler of Heaven',t0=1.0)),
 L("He worked until every horse in the sky was fat and fast.","estabulo-celeste",[1.1,1.3],[0.4,0.55],0.6,["brilho"],[A('wk_armado','andar','sorriso',[0.3,0.5],0.93,0.9)]),
 L("Then a stable hand laughed in his face. His title was the *lowest* rank in Heaven.","estabulo-celeste",[1.4,1.55],0.52,0.58,[],[A('cavalarico','apontar','riso',0.64,0.93,1.0),A('wk_armado','parado','choque',0.38,0.93,1.0)]),
 L("Wukong smashed the stable gate and flew home in a rage.","estabulo-celeste",[1.5,1.7],0.5,0.58,["tremor@1.0","poeira","velocidade"],[A('wk_armado','golpe','raiva',0.45,0.93,1.1)]),
 L("On a giant banner he painted his new name: *Great Sage, Equal to Heaven*.","caverna-cortina",[1.2,1.4],0.5,0.6,["dourado"],[A('wk_armado','triunfo','riso',0.5,0.93,1.05),A('clone1','triunfo','sorriso',0.25,0.95,0.8),A('clone2','triunfo','sorriso',0.75,0.95,0.8)],dict(tipo='fato',titulo='His self-given title',valor='Qitian Dasheng',sub='Great Sage, Equal to Heaven',t0=1.2)),
 L("Heaven sent its best generals. He beat every single one before lunch.","campo-batalha-ceu",[1.3,1.5],0.5,0.58,["tremor@1.2","flash@1.2","faiscas"],[A('wk_armado','golpe','raiva',0.4,0.93,1.05),A('general','cair','dor',0.66,0.95,1.0)]),
 L("So the Emperor gave up, let him keep the title, and handed him the Peach Garden.","jardim-pessegos",[1.1,1.25],0.5,0.6,["brilho","neblina"],[A('wk_armado','andar','sorriso',[0.35,0.5],0.93,0.95)]),
 L("Its oldest trees ripen once every *nine thousand* years. One bite means eternal life.","jardim-pessegos",[1.3,1.45],0.5,0.55,["brilho"],[A('wk_armado','sentar','riso',0.5,0.9,1.0)],dict(tipo='fato',titulo='Peaches of Immortality',valor='9,000 years',sub='the oldest trees ripen once every nine thousand years',t0=0.6)),
 L("Then he heard the Queen Mother was throwing a banquet. Every god was invited. Except *him*.","jardim-pessegos",[1.2,1.35],0.5,0.6,["dourado"],[A('rainha_mae','parado','sorriso',0.62,0.93,1.0),A('wk_armado','agachar','raiva',0.3,0.94,0.9)]),
 L("He drank the gods' wine first and stumbled into the palace of *Laozi*.","palacio-laozi",[1.15,1.3],[0.4,0.5],0.6,["neblina"],[A('wk_armado','andar','riso',[0.3,0.45],0.93,0.95)],dict(tipo='nome',titulo='Laozi',sub='Sage of the Way, keeper of the elixir',t0=2.2)),
 L("There he swallowed a whole gourd of golden pills made to grant immortality.","palacio-laozi",[1.5,1.7],0.5,0.56,["dourado","brilho"],[A('wk_armado','triunfo','riso',0.5,0.93,1.15)]),
 L("Now he had five reasons he couldn't die. And all of Heaven wanted his head.","palacio-laozi",[1.3,1.5],0.5,0.58,["escuro","vermelho"],[A('laozi','susto','raiva',0.66,0.93,1.0),A('wk_armado','parado','riso',0.38,0.93,1.0)]),
 L("One hundred thousand heavenly soldiers surrounded his mountain.","floresta-macacos",[1.0,1.15],0.5,0.55,["neblina","escuro"],[A('soldado','lutar','raiva',0.2,0.95,0.75),A('soldado','lutar','raiva',0.4,0.96,0.8),A('soldado','lutar','raiva',0.62,0.96,0.8),A('soldado','lutar','raiva',0.82,0.95,0.75)],dict(tipo='fato',titulo='The army of Heaven',valor='100,000',sub='soldiers sent for one monkey',t0=0.6)),
 L("He blew on his hairs. Each one became a monkey with a staff.","floresta-macacos",[1.3,1.45],0.5,0.58,["poeira","flash@1.4"],[A('wk_armado','lutar','riso',0.5,0.93,1.05),A('clone1','lutar','raiva',0.27,0.95,0.85),A('clone2','lutar','raiva',0.73,0.95,0.85)]),
 L("Then came Erlang, the god with a *third eye*.","campo-batalha-ceu",[1.35,1.55],0.55,0.58,["tremor@1.6","raio"],[A('erlang','lutar','determinado',0.64,0.93,1.05),A('wk_armado','lutar','raiva',0.38,0.93,1.05)],dict(tipo='nome',titulo='Erlang Shen',sub='The god with the third eye',t0=0.8)),
 L("Bird against hawk, fish against cormorant, through all seventy-two shapes.","campo-batalha-ceu",[1.5,1.65],0.5,0.58,["velocidade","faiscas"],[A('wk_armado','pular','raiva',[0.35,0.55],0.9,1.0,altura=0.15),A('erlang','golpe','raiva',0.68,0.93,1.0)]),
 L("Finally a dog bit his leg and a steel ring cracked his *head*.","campo-batalha-ceu",[1.6,1.8],0.45,0.58,["tremor@1.3","flash@1.3","sangue"],[A('wk_armado','cair','dor',0.45,0.86,1.1)]),
 L("Blades bounced off. Fire would not burn him.","campo-batalha-ceu",[1.4,1.55],0.5,0.58,["raio","faiscas"],[A('wk_armado','deitado','riso',0.5,0.8,1.05),A('soldado','golpe','medo',0.72,0.94,0.9)]),
 L("So Laozi threw him into his eight trigram furnace and *sealed* the door.","palacio-laozi",[1.3,1.5],0.5,0.58,["vermelho","escuro","tremor@2.0"],[A('laozi','apontar','raiva',0.62,0.93,1.0)]),
 L("Forty-nine days of fire. Nobody was ready for what walked out. Part five, tomorrow.","forno-laozi",[1.5,1.7],0.5,0.55,["vermelho","escuro"],[]),
]
P5=dict(base, codigo='CLX05', _obs='Wukong ilustrado parte 5, final (publica como CL062).', parte=5)
P5['elenco']=dict(wk_armado=WK, imperador=imp, laozi=laozi,
  buda=dict(tipo='humano',rosto_cor='#e8c070',cabelo='coque',cabelo_cor='#1a2a5a',manto='#e07a20',olhos_ouro=True),
  tang=dict(tipo='humano',rosto_cor='#f0d4b0',cabelo='careca',manto='#b8231c',roupa='tunica',roupa_cor='#d8a431'))
P5['lineas']=[
 L("How does a monkey who can't die end up trapped under a mountain for *500 years*?","forno-laozi",[1.55,1.75],0.5,0.56,["vermelho","escuro"],[A('wk_armado','agachar','raiva',0.5,0.94,1.25)]),
 L("The furnace burned for forty-nine days.","palacio-laozi",[1.2,1.35],0.5,0.58,["vermelho","neblina"],[A('laozi','parado','sorriso',0.62,0.93,1.0)]),
 L("On the last day the lid cracked, and Wukong burst out *laughing*.","palacio-laozi",[1.15,1.3],0.5,0.6,["tremor@0.9","flash@0.9","faiscas"],[A('wk_armado','pular','riso',[0.45,0.55],0.92,1.0,altura=0.12),A('laozi','cair','choque',0.75,0.93,0.95)]),
 L("The smoke had burned his eyes gold forever. Now he could see through any *lie*.","palacio-laozi",[1.7,1.9],0.5,0.52,["dourado"],[A('wk_armado','parado','determinado',0.5,0.93,1.35)],dict(tipo='fato',titulo='Fiery Golden Eyes',valor='49 days',sub='inside the furnace turned his eyes to gold',t0=0.8)),
 L("He kicked the furnace over and fought his way to the Hall of Jade.","salao-jade",[1.3,1.5],[0.4,0.55],0.58,["tremor@1.0","poeira","velocidade"],[A('wk_armado','correr','raiva',[0.25,0.55],0.93,1.0)]),
 L("The Emperor hid behind his throne and called for the *Buddha*.","salao-jade",[1.2,1.35],0.55,0.6,["dourado"],[A('imperador','agachar','medo',0.66,0.94,0.95),A('wk_armado','triunfo','riso',0.36,0.93,1.0)]),
 L("The Buddha arrived smiling and offered the monkey a simple bet.","salao-jade",[1.1,1.25],0.5,0.58,["brilho","dourado"],[A('buda','parado','calmo',0.6,0.93,1.1),A('wk_armado','parado','choque',0.36,0.93,0.95)],dict(tipo='nome',titulo='The Buddha',sub='Tathagata of the Western Heaven',t0=1.5)),
 L("Jump out of my palm, and Heaven is *yours*. Fail, and you stay on Earth.","salao-jade",[1.4,1.55],0.6,0.56,["brilho"],[A('buda','apontar','sorriso',0.6,0.93,1.15)]),
 L("Wukong laughed. One cloud jump carried him a hundred and eight thousand li.","mao-buda",[1.05,1.2],0.5,0.6,["velocidade"],[A('wk_armado','pular','riso',[0.3,0.62],0.92,0.9,altura=0.15)],dict(tipo='fato',titulo='One somersault cloud',valor='108,000 li',sub='about 54,000 km in a single jump',t0=1.6)),
 L("At the end of the world he found five pink pillars holding up the sky.","mao-buda",[1.0,1.15],0.5,0.5,["neblina","brilho"],[A('wk_armado','parado','choque',0.5,0.94,0.75)]),
 L("On the middle one he wrote: *The Great Sage was here*. Then he peed on it.","mao-buda",[1.5,1.7],0.5,0.56,[],[A('wk_armado','agachar','riso',0.5,0.93,1.15)]),
 L("He flew back in a blink and demanded his prize.","salao-jade",[1.3,1.45],0.55,0.58,["velocidade"],[A('wk_armado','triunfo','riso',0.38,0.93,1.0),A('buda','parado','calmo',0.64,0.93,1.1)]),
 L("The Buddha raised his hand. The words were on his middle finger. And it still *smelled*.","salao-jade",[1.45,1.65],0.6,0.55,["dourado"],[A('buda','apontar','sorriso',0.6,0.93,1.2)]),
 L("Those pillars were his fingers. Wukong had never left his *palm*.","salao-jade",[1.6,1.8],0.45,0.56,["escuro"],[A('wk_armado','susto','choque',0.45,0.93,1.25)]),
 L("Before he could run, the hand became Five Finger Mountain and fell on him.","montanha-prisao",[1.1,1.3],0.5,0.6,["tremor@1.5","poeira","flash@1.5"],[A('wk_armado','cair','medo',0.5,0.96,0.9)]),
 L("For *five hundred* years he ate iron pellets and drank melted copper.","montanha-prisao",[1.5,1.7],0.5,0.6,["escuro","chuva"],[A('wk_armado','deitado','triste',0.5,0.8,1.15)],dict(tipo='fato',titulo='Five Finger Mountain',valor='500 years',sub='buried with only his head out',t0=0.8)),
 L("Rain, snow, centuries. Only his golden eyes still moved.","montanha-prisao",[1.8,2.0],0.5,0.62,["neblina"],[A('wk_armado','deitado','calmo',0.5,0.8,1.3)]),
 L("Until a young monk climbed the mountain and tore off the Buddha's seal.","montanha-prisao",[1.2,1.4],0.55,0.6,["brilho"],[A('tang','escalar','determinado',[0.6,0.66],0.93,1.0),A('wk_armado','deitado','choque',0.35,0.8,1.0)]),
 L("Tang Sanzang needed a bodyguard for the long road west.","montanha-prisao",[1.3,1.45],0.6,0.58,["brilho"],[A('tang','parado','calmo',0.62,0.93,1.05)],dict(tipo='nome',titulo='Tang Sanzang',sub='The monk of the Journey to the West',t0=1.2)),
 L("The mountain split in two. The Monkey King was *free*.","montanha-prisao",[1.3,1.55],0.5,0.58,["tremor@0.8","flash@0.8","poeira","dourado"],[A('wk_armado','triunfo','riso',0.45,0.93,1.15),A('tang','parado','sorriso',0.72,0.93,0.95)]),
 L("And it all began with a stone that cracked open on a mountain. Would you take the bet?","pico-pedra",[1.2,1.4],0.5,0.55,["dourado","neblina"],[]),
]
for n,p in ((4,P4),(5,P5)):
    w=sum(len(re.findall(r"[A-Za-z0-9'’,-]+",re.sub(r'[*.,!?:]',' ',l['texto']))) for l in p['lineas'])
    w=sum(len(l['texto'].replace('*','').split()) for l in p['lineas'])
    print(n,w,len(p['lineas']))
    json.dump(p,open(f'/tmp/claude-0/cd/motor-ilustrado/testes/wukong-{n}.json','w'),ensure_ascii=False,indent=1)
