const pages = [
    `<h1>Mate</h1><p class="chapter-title">CHAPTER 1</p><p>She tore him apart and remade him.<br>It took her less than a second.</p><p>Present day</p><p>IF SUCH A THING AS AN IDEAL NIGHT TO DIE EXISTED, IT WOULD not be this one.</p><p>There’s so much wrong with it. I could bitch about the recent rainstorm, the weak garlic-clove-sized moon, the uncharged phone sitting on my nightstand. The main issue, though, is that I’m wearing no more than two items of clothing: undies and a camisole. They were both perfectly adequate underneath my fluffy comforter. Unfortunately, I left that back at the cabin. When I woke up at one a.m. to the realization that someone was breaking in.</p>`,
    
    `<p>It’s fall. In a place that a year or so ago—back when I still foolishly believed I was Human—I would have called Oregon. Now that my Were genes are taking over, stuff like cartography and state lines have become comically trivial, but the crux of the matter remains: November in the Northwest is cold, and I’m not dressed appropriately.</p><p>The goddamn timing, I mouth to myself, darting behind the gnarly trunk of a Douglas fir. Chest heaving, I stare down at my very Human-shaped hand. I visualize the change, willing my bitten-to-the-quick nails to turn into claws.</p><p>Shift into a wolf, Serena. Shift into a fucking wolf, or I swear to God that . . .</p>`,
    
    `<p>That nothing. My body refuses to be shamed into compliance. I glance up at the sky, but the much-publicized pull of the moon offers only the most apathetic of tugs. With a muted groan, I resume my sprint through the forest, bare feet slipping through fresh mud. A dozen little cuts crisscross my soles and shins. The longer I run, the fainter my hope that the soil will conceal the iron scent of my blood.</p><p>And I’ve been running for a while.</p><p>The intruder is tracking me. Gaining ground. The wind carries his ever-closer smell, and I don’t like what it tells me. Vampyre. Adult in his prime. Eager. The thrill of the chase titillates him, and his arousal scrapes against the bottom of my stomach.</p>`,
    
    `<p>As revolting as that is, though, it’s the least of my problems. Because if I can smell him this clearly, there’s a very high chance that he’s close enough to—</p><p>“At long fucking last.” The words hiss like bullets in my ear. An instant later, my back is slammed into a trunk. I don’t know what hurts most—the bark biting into my skin, the hand he curls around my throat, or his disgusting, maniacal stench.</p><p>The forest is pitch black. There’s no darkness through which Weres cannot see, but I got only half of those nice wolf genes, which means that my night vision is hit or miss. Still, the Vampyre’s bloodlust is unmistakable. As is the blade in his hand. “Not very fast, are you?” he growls.</p>`,
    
    `<p>No shit. I swallow an eye roll and make myself moan helplessly. </p><p>“Please,” I beg. His scent explodes, like having women at his mercy is his kink of choice—how predictable—so I give him some more. “Please, don’t kill me. I’ll do whatever you want.”</p><p>“Whatever I want?”</p><p>He’s so interested. I let out a whimper and widen my eyes. “Anything.”</p><p>His eyes travel down my body, as if to assess what I might be useful for—organ trafficking, bone broth, yard maintenance. Unlike me, he is fast. Preternaturally so. With dizzying speed, his knife slices through the front of my silk top, deepening the neckline.</p><p>This fucker.</p>`,
    
    `<p>But as he leers, his scent spikes. Which means that he’s distracted enough by what he’s uncovered that I get a chance to put the self-defense classes my sister forced me to attend to good use.</p><p>Knee to the groin.</p><p>Headbutt to the nose.</p><p>And, as a little extra, an elbow to the stomach. I mean, why not?</p><p>The Vampyre grunts. Mutters a few variations of “fucking whore.” I’m free, though. I might not be able to outrun him, but I can grab a fistful of soil and throw it at his eyes, which does just enough damage to slow him down. I frantically look around and— yes. I spot a sharp, jagged rock. Bend down to palm it.</p>`,
    
    `<p>“You fucking freak of nature.” The Vampyre is on me again, twisting my arm behind my back. I let out a yelp, but the rock is in my hand. Tragically, he’s holding my wrist at the wrong angle for me to strike.</p><p>In theory, I know what the next step is—move closer, lower your center of gravity, rotate your body, strike with your free hand—and boy, do I try. Sadly, the Vampyre is a notch or two above the average fighter, and none of it works.</p><p>That’s when my stomach starts churning for real. This is not going to end well. “Let. Me. Go,” I spit out.</p><p>“Shut up.” The vinegar of his scent stings my nose. He’s even more worked up now. And I’m in even deeper shit. “I may not be allowed to kill you, but I can make you hurt a whole fucking lot before I—”</p>`,
    
    `<p>“Can you, though?” A male voice interrupts him. It travels in our direction from some place in the thicket of trees. A rich, slow curl, at once vicious and detached. No answer exists that could faze this voice. “Can you really, buddy?”</p><p>The Vampyre’s frame stiffens. Before he can leash his instinctive reaction, I smell utter, abject, acrid fear.</p><p>I close my eyes. Force my burning lungs to inhale slowly. Let my prospect of the next ten minutes readjust, mold to a shape that is . . . still unfortunate, yes, but a touch less.</p><p>Koen.</p><p>Koen’s here.</p><p>It will be all right.</p>`,
    
    `<p>The Vampyre yanks me in front of him, holding his knife to my throat. I wonder if he means to use me as a hostage, or as a meat shield that barely reaches the top of his chest. “What are you doing here?” he barks.</p><p>It’s a fair question. Koen lives several hours away and hasn’t been around in nearly two months, since the day he dropped me off at the cabin, at my request, with a metric ton of supplies, a lingering stare, and a mocking Have fun chatting up the spruces, killer that didn’t quite match the intensity in his eyes.</p><p>“Did you just ask what I’m doing in my territory? What the fuck are you doing, shitdump?” A handful of long, unhurried strides, and Koen emerges from the thicket.</p>`,
    
    `<p>He’s different. From anyone else, yes, but also since I last saw him. His black hair is tied back at the top of his head in an overgrown, unkept version of his latest cut. He hasn’t shaved in weeks, and I suspect he might be a touch behind on sleep, too. His presence, though, has the usual effect on me: it gives me ballast and bolts me to the ground when I’m on the verge of being spirited away.</p><p>Alpha.</p><p>His deep scent is unmistakable. Solid and placating. The perfect counterpoint to the panic of the Vampyre.</p><p>Who snarls, “I’ll kill her if you come closer.”</p>`,
    
    `<p>Koen, of course, comes closer. With the placid air of someone who has never doubted his ability to hammer the world to his will. “Uh-uh. Serena, he says he’s going to kill you. You cool with that?” His tone is pure intellectual curiosity. Charcoal eyes glow steadily in the night.</p><p>“I did run out of instant noodles last week,” I croak. Not my best idea, since the Vampyre nearly twists my humerus out of its socket. But the amused twitch of Koen’s mouth almost makes up for it.</p><p>“You are Koen Alexander, aren’t you? The Alpha of the Northwest.”</p><p>“I sure am. What’s your name, bud?”</p><p>“That’s not important. If you come any closer—”</p>`,
    
    `<p>Koen clucks his tongue. “You gotta tell me your name, or I’ll have to make one up. Any ideas, Serena?”</p><p>I clear my throat. “I like Bob.”</p><p>“Bob the Vampyre. Love it.”</p><p>“That’s not my na—”</p><p>“It is if the lady says so, shartstain. Wanna tell me what you’re doing in my territory before I rip off your balls and shove them down your throat?”</p><p>The Vampyre doesn’t reply but wrenches my arm so violently, my vision spots and I nearly lose consciousness. When I can parse out sounds again, he’s pulling me into his body and snarling, “She might be too valuable to kill, but I can do a whole lot of damage.”</p>`,
    
    `<p>“Go ahead, then.” For the first time since he appeared, Koen’s eyes catch on mine. I read absolutely nothing in them. “This girl can take a lot. Am I wrong, Serena?”</p><p>I somehow find the strength to shake my head—a blatant lie. And yet. It might be a pain-induced olfactory hallucination, but I think I smell how pleased it makes him.</p><p>“You sure?” the Vampyre asks. “She’s half Human, after all.” “And you’re half jackass. What a stunning coincidence.”</p><p>“They all want her, you know. Since that interview she gave, every Vampyre on the continent has been looking for her.”</p>`,
    
    `<p>“Yeah. I’m sure there are plenty of vivisection tables with her name on it.”</p><p>“But do you know how much they’ll pay?” The Vampyre’s voice takes on a sudden persuasive bent. “As the person who brings the hybrid to them, I will be able to name my price.”</p><p>“Sure. And they definitely won’t get rid of you the second you hand her over.”</p><p>The Vampyre snorts. “I’m smarter than that. I’m the first who found her—do you think I’m the only one after her bounty? Others are going to follow. Once they discover that you’re giving her sanctuary, they’ll flock here. Are you sure you want to spend the rest of your life protecting a half Human? Let me take her off your hands. Look the other way.”</p>`,
    
    `<p>“As far as offers go, Bob, this one is lazy as fuck.” Koen spreads his arms. “What do I get out of it? You’re supposed to offer something in return. Split the reward, wash my car—”</p><p>“They say she’s your mate.”</p><p>It’s like the forest hears the words. Like it understands them. For a brief second every critter, every leaf, every drop of water stills, as if waiting for Koen’s reaction.</p><p>“Do they, now?” He advances, still relaxed. He’s taking a night stroll. Wandering around a museum. Unburdened of all worries.</p><p>“Yes. And you know what else they say?”</p><p>“Bet you're going to tell me.”</p><p>“That she rejected you.”</p>`,
    
    `<p>“Ouch.” Koen doesn’t look to be in any pain. “And your unimpeachable reasoning is that I’ll happily exact my revenge on her by allowing you to take her.”</p><p>“Wouldn’t it be better? To be done with her once and for all?”</p><p>Koen lifts a hand, making the Vampyre jolt. All he does, though, is massage his temple like an exhausted parent would. Wondering why his toddler is stuffing another crayon up a nostril. “Man. I’m going to have to kill you, and Jorma’s gonna make me do a fuckton of paperwork for that.” He sighs, and the trace of impatience in his voice makes my blood curdle.</p><p>Not the Vampyre’s, though. Because what he says next is “And she’s pretty, isn’t she?”</p>`,
    
    `<p>I go very, very still. And so does Koen.</p><p>“And right now she’s not in a position to reject anyone.”</p><p>No response.</p><p>“Do you get my meaning? Alpha? ”</p><p>Any pretense of casualness melts out of Koen’s demeanor. Every atom of his body is now on high alert, orienting toward prey. Toward me.</p><p>“Like I said, she’s very beautiful. I wouldn’t mind tossing her your way, after I’m done with her,” he offers. Koen’s eyes contract to displeased pinpricks, and his scent gives off such unequivocal aversion, even the Vampyre knows to backtrack. “Or you could have your fun with her. Then I’d take her away, no questions asked. She’d have no one to complain to.”</p>`,
    
    `<p>An owl hoots in the distance. I hold my breath, waiting for Koen to tell the Vampyre to fuck off, but the silence lingers, and his eyes grow opaque, and after a while he . . .</p><p>Koen nods.</p><p>My heart plummets.</p><p>No. He wouldn’t. He would never.</p><p>“Koen?” I say. Half question, half plea.</p><p>“In my defense, Serena . . .” Koen lifts his shoulders. “It’s always fucking something with you.”</p><p>Ice prickles all over my skin. “No. Don’t. Koen, don’t—”</p><p>“I took the liberty to get started,” the Vampyre says, and before I can wonder what he means, his free hand lowers the torn half of my top down my shoulder.</p>`,
    
    `<p>Koen’s eyes linger on my nearly bare chest like I’m no more than a cut of flesh. An offering to be appraised. Something created for him to use. I watch his pupils do an odd dance, sense a shift in his scent before he murmurs, “See, this is how you make a deal. I knew you had it in you, Bob.”</p><p>Once again, I beg my body to shift to its wolf form. Once again, I am ignored. With a furious grunt, I begin thrashing in the Vampyre’s grip, desperately trying to break free. But he’s stronger than me, and Koen’s probably stronger than the two of us put together. I can knock out one of them, and I’d still be screwed.</p>`,
    
    `<p>I clutch the rock in my palm, but folded as he has me, I still cannot use it.</p><p>Terror rushes through my body. Thumps against my chest.</p><p>“She’s all yours, Alpha. Do what you will with her.” The Vampyre lets out a winded, obnoxious laugh. He lowers his blade and pushes me a few inches forward without letting go of my wrists. He stinks like he knows that it’s all over for me—that he’s won. “Maybe she’d even enjoy it?”</p><p>Koen considers the matter as he steps closer, near enough that I can feel his heat, and I bare my teeth at him as I squirm in the Vampyre’s clutch. This can’t be for real. Alpha protects, says a calm Were voice that lives inside my bones. Alpha is home. Koen is not like that.</p>`,
    
    `<p>Except, I’m not so sure.</p><p>Koen stops in front of me, staring like I’m at his disposal, and yeah. He is exactly like that.</p><p>“Would she?” he wonders, voice low and rich, eyes caressing my face and lingering on my bare breast. Closer still, and his presence envelops me like a warm blanket. His scent blooms in my nostrils, safe, grounding, so breathtakingly perfect that for a moment I forget about the Vampyre behind me, the pine needles jabbed into the soles of my feet.</p><p>“Please,” I mouth softly, but I don’t think Koen hears me. His hand comes up to my face. Wraps around my cheek, thumb pressing into my lower lip.</p>`,
    
    `<p>“Would you, Serena? Enjoy it?”</p><p>Panic bursts anew in my chest. I shake my head violently.</p><p>No. No.</p><p>“Well, then.” His eyes soften, and he lets out a half-resigned, half-amused sigh. “Better make use of that rock in your hand, killer.”</p><p>It takes me a beat to understand his meaning, and to realize that the Vampyre’s hold on my wrist has loosened. Twisting my arm free and stabbing the jagged edge of the rock into his stomach takes so little effort, it’s almost anticlimactic.</p>`,
    
    `<p>“What the—” The Vampyre doubles over. I’m about to hit him again, but he bounces back and slams me to the ground. He lifts his knife above his head, aiming for my throat. “You fucking bitch—”</p><p>He stops with an abrupt gasp, as though in the grip of a sudden illuminating revelation. He stares down at me, eyes bulging, mouth wide open, and I almost expect him to . . . apologize? Then, after coughing up a small rivulet of mulberry-colored blood, he loses his balance. I observe his descent, horrified, as he collapses right by my side, face-first into a patch of moss.</p><p>He does not move again.</p>`,
    
    `<p>Neither do I. I don’t know what it says about me, but I’m incapable of not staring as blood gurgles out of the deep claw-shaped parallel wounds on his back, iron blending with the earthy smell of the soil.</p><p>It’s a long while before I’m able to glance down at my body— miraculously intact, if mostly naked—and then up at Koen—glibly unimpressed. Anyone else would be helping me up, but not the Alpha of the Northwest pack. Instead, he slowly shakes his head, wiping the hand he just used to kill a man across his flannel. The deep-violet strokes create an oddly pretty painting over the black- and-white canvas.</p>`,
    
    `<p>It takes him a while to remember that I exist. “Evening, Serena.” The intensity of a few moments ago has dissolved, and he sounds indifferent. Maybe he knows that a single ounce of sympathy would knock me over. Maybe he truly does not, and has never, given a fuck about anything.</p><p>“How’s your night been?”</p><p>“Uneventful,” I rasp out.</p><p>“Yeah? You look like shit.”</p><p>“Do I.” Gelid sweat slides down my temple and between my breasts, which I hurry to cover as best as I can. “Is this the way you talk to your beloved mate?”</p>`,
    
    `<p>A single eyebrow lifts. “I said you were my mate. Not that I loved you.”</p><p>I gasp out a single, outraged laugh, but at least I’m not crying. It’s nice to keep what little dignity I have left as Koen gives me a cool, appraising look and crouches next to me.</p><p>“We have to go,” he tells me.</p><p>“Where?”</p><p>“To the Den.” He picks me up with his arms under my back and knees. The chill becomes a distant memory. “Woodland retreat’s over, killer.”</p>`
];

let currentPage = 0;

function renderPages(immediate = false) {
    const book = document.getElementById('book');
    const existingPages = book.querySelectorAll('.page');
    
    const updateContent = () => {
        book.innerHTML = '';
        
        const leftPage = document.createElement('div');
        leftPage.className = 'page left-page' + (immediate ? '' : ' fade-out');
        leftPage.innerHTML = pages[currentPage] || '';
        
        const rightPage = document.createElement('div');
        rightPage.className = 'page right-page' + (immediate ? '' : ' fade-out');
        rightPage.innerHTML = pages[currentPage + 1] || '';
        
        book.appendChild(leftPage);
        book.appendChild(rightPage);

        if (!immediate) {
            // Trigger reflow to allow transition
            leftPage.offsetHeight;
            rightPage.offsetHeight;

            leftPage.classList.remove('fade-out');
            rightPage.classList.remove('fade-out');
        }
        
        document.getElementById('prev-btn').disabled = currentPage === 0;
        document.getElementById('next-btn').disabled = currentPage >= pages.length - 2;
    };

    if (immediate || existingPages.length === 0) {
        updateContent();
    } else {
        // Add fade-out class
        existingPages.forEach(p => p.classList.add('fade-out'));
        setTimeout(updateContent, 500);
    }
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage -= 2;
        renderPages();
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentPage < pages.length - 2) {
        currentPage += 2;
        renderPages();
    }
});

renderPages(true);
