import pyaudio
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import time
from utils import *
from model import Generator
import torch
import librosa
import pyworld
from os.path import join, basename
from convert_realtime import *
p = pyaudio.PyAudio()

def test_real(config):
    RATE = 16000
    CHUNK = 80000
    gain = 2 ^ 3
    # Model init
    sampling_rate, num_mcep, frame_period=16000, 56, 5
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    G = Generator().to(device)
    test_loader = TestDataset(config)
    # Restore model
    print("target mean: ", test_loader.logf0s_mean_trg)
    print("target std: ", test_loader.logf0s_std_trg)
    print("src mean: ", test_loader.logf0s_mean_src)
    print("src std: ", test_loader.logf0s_std_src)
    print(f'Loading the trained models from step {config.resume_iters}...')
    G_path = join(config.model_save_dir, f'{config.resume_iters}-G.ckpt')
    G.load_state_dict(torch.load(
        G_path, map_location=lambda storage, loc: storage))
    # Player
    p = pyaudio.PyAudio()

    player = p.open(format=pyaudio.paInt16, channels=1, rate=RATE, output=True,
                    frames_per_buffer=CHUNK)
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=RATE,
                    input=True, frames_per_buffer=CHUNK)
    '''
    plt.ion()
    figure, ax = plt.subplots()
    ax.set_ylim([-1, 1])
    s = np.fromstring(stream.read(CHUNK), dtype=np.int16)
    x = np.linspace(0, 1, CHUNK)
    line1, = ax.plot(x, s)
    '''
    for i in range(int(200*RATE/CHUNK)):  # do this for 10 seconds
        s = np.fromstring(stream.read(CHUNK), dtype=np.int16)
        s = s*gain/32768 # normalize

        [f0, timeaxis, sp, ap] = world_decompose(s, fs=RATE, frame_period=5) # 5ms*16kHz = 80samples/frame, nframes = CHUNK/80 = 1000 
        #print("f0: ", np.average(f0), "hz")
        #print("sp shape: ", sp.shape)
        coded_sp = world_encode_spectral_envelop(
            sp=sp, fs=RATE, dim=num_mcep)
        coded_ap = world_encode_aperiodic(ap, sampling_rate)
        # decide feature type
        feature = coded_sp
        if config.feat_type == 'apsp':
            feature = np.concatenate((coded_sp, coded_ap, coded_ap, coded_ap, coded_ap), axis=1)
            assert(feature.shape[1] == 60)
        elif config.feat_type == 'ap':
            feature = coded_ap

        # normalizationi
        feature_norm = (feature - test_loader.feat_mean_src) / \
            test_loader.feat_std_src
        feature_norm_tensor = torch.FloatTensor(
            feature_norm.T).unsqueeze_(0).unsqueeze_(1).to(device)
        conds = torch.FloatTensor(test_loader.spk_c_trg).to(device)
        print("Before being fed into G: ", coded_sp.shape)

        spk_conds = torch.FloatTensor(test_loader.spk_c_mix).to(device)
        #spk_conds = torch.FloatTensor([0.5, 0.5]).to(device)
        # print(spk_conds.size())
        feature_converted_norm = G(
            feature_norm_tensor, spk_conds).data.cpu().numpy()
        feature_converted = np.squeeze(
            feature_converted_norm).T * test_loader.feat_std_trg + test_loader.feat_mean_trg
        feature_converted = np.ascontiguousarray(feature_converted)
        print("After being fed into G: ", feature_converted.shape)
        if config.feat_type == 'apsp' or config.feat_type == 'sp':
            wav_transformed = world_speech_synthesis(f0=f0*0.8, coded_sp=feature_converted,coded_ap=coded_ap, 
                fs=sampling_rate, frame_period=frame_period, feat=config.feat_type)
            '''
            [f0_t, timeaxis, sp, ap] = world_decompose(
                wav_transformed, fs=RATE, frame_period=5)
            
            wav_transformed = pyworld.synthesize(
                f0_t/0.8, sp, ap, fs=sampling_rate, frame_period=5)
            '''
        elif config.feat_type == 'ap':
            wav_transformed = world_speech_synthesis(f0=f0, coded_sp=coded_sp, 
                coded_ap=feature_converted, fs=sampling_rate, frame_period=frame_period, feat=config.feat_type)
        else:
            assert False, "Not a valid feature type!"   
        #wav_transformed = world_speech_synthesis(f0=f0, coded_sp=coded_sp_converted,
        #                                        ap=ap, fs=sampling_rate, frame_period=frame_period)
        #wav = pyworld.synthesize(f0, sp, ap, fs=RATE, frame_period=5.0)
        # plot waveform
        '''
        line1.set_ydata(wav)
        figure.canvas.draw()
        figure.canvas.flush_events()
        '''
        s_out = np.int16(wav_transformed*32768)
        player.write(s_out, CHUNK) # play_back
    stream.stop_stream()
    stream.close()
    p.terminate()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    # Model configuration.
    parser.add_argument('--num_speakers', type=int, default=2,
                        help='dimension of speaker labels')
    parser.add_argument('--num_converted_wavs', type=int,
                        default=6, help='number of wavs to convert.')
    parser.add_argument('--resume_iters', type=int,
                        default=None, help='step to resume for testing.')
    parser.add_argument('--src_spk', type=str, default='falset',
                        help='target speaker.')  # MODIFY
    parser.add_argument('--trg_spk', type=str, default='chest',
                        help='target speaker.')  # MODIFY
    parser.add_argument('--feat_type', type=str,
                        default='apsp', help='target speaker.')
    # Directories.
    parser.add_argument('--train_data_dir', type=str,
                        default='./data/codedApSp_belt56_a/train')
    parser.add_argument('--test_data_dir', type=str, default='./data/mc/test')
    parser.add_argument('--wav_dir', type=str, default="./data/wav16")
    parser.add_argument('--log_dir', type=str, default='./logs')
    parser.add_argument('--model_save_dir', type=str, default='./models')
    parser.add_argument('--convert_dir', type=str, default='./converted')

    config = parser.parse_args()

    print(config)
    if config.resume_iters is None:
        raise RuntimeError("Please specify the step number for resuming.")
    test_real(config)
