# Singing voice synthesis

Singing voice synthesis is a very popular topic. However, the synthesis result’s quality is hard to predict. Some unpleasant voice timbre may occur at some unexpected places of the singing. Therefore, manually editing the timbre of singing voice is an essential task.

We propose a method to convert singing voice with the StarGAN-VC[6], which is a voice conversion model dealing with speaking voice originally. Furthermore, we build a new dataset emphasizing on "chest voice and falsetto" of Mandarin popular music. The total length of  our data is about 30 minutes. We use World Vocoder[8] as the acoustic model to extract features (aperiodicity parameter, spectral envelope and F0) which  comprise the audio. Those features will be converted by the trained StarGAN model and reconstructed by the acoustic model.

The converted audio can successfully fool people’s ears. However, if a real chest voice/falsetto audio is provided, people still can tell the differences between the converted one and the real singing voice. Besides, we also discovered that the F0 shifting using World will also affect the voice timbre. Thus, each feature extraction method of World Vocoder is explained in detail. Many observations and ideas between voice timbre, human sense of hearing and acoustic features are also discussed in this report. 

Last, we try to build a website to deploy our model. We use React as frontend and Flask as backend. Our final goal is to let people recording their singing on the website, and they can also edit their voice on this website using our voice conversion model. Finally, people can download the audio file on this website.
